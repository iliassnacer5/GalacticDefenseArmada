class Vehicule {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 4;
        this.maxForce = 0.2;
        this.r = 16;
        this.color = "white";
        this.wanderTheta = 0; // Initialize wander theta
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        strokeWeight(1);
        stroke(this.color);
        noFill();
        triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
        pop();
    }

    edges() {
        if (this.pos.x > width + this.r) this.pos.x = -this.r;
        else if (this.pos.x < -this.r) this.pos.x = width + this.r;
        if (this.pos.y > height + this.r) this.pos.y = -this.r;
        else if (this.pos.y < -this.r) this.pos.y = height + this.r;
    }

    // --- STEERING BEHAVIORS ---

    seek(target, arrival = false) {
        let force = p5.Vector.sub(target, this.pos);
        let d = force.mag();

        if (arrival && d < 100) {
            let m = map(d, 0, 100, 0, this.maxSpeed);
            force.setMag(m);
        } else {
            force.setMag(this.maxSpeed);
        }

        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
    }

    flee(target) {
        return this.seek(target).mult(-1);
    }

    arrive(target) {
        return this.seek(target, true);
    }

    pursue(vehicle) {
        let target = vehicle.pos.copy();
        let prediction = vehicle.vel.copy();
        prediction.mult(10);
        target.add(prediction);
        return this.seek(target);
    }

    evade(vehicle) {
        let pursuit = this.pursue(vehicle);
        return pursuit.mult(-1);
    }

    wander() {
        // Wander point
        let wanderPoint = this.vel.copy();
        wanderPoint.setMag(100);
        wanderPoint.add(this.pos);

        // Wander radius
        let wanderRadius = 50;

        // Calculate new target for wander
        let theta = this.wanderTheta || 0;
        theta += random(-0.3, 0.3);
        this.wanderTheta = theta;

        let x = wanderRadius * cos(theta);
        let y = wanderRadius * sin(theta);
        wanderPoint.add(x, y);

        let steer = this.seek(wanderPoint);

        // Debug Wander
        if (typeof debugMode !== 'undefined' && debugMode) {
            push();
            translate(this.pos.x, this.pos.y); // Start from vehicle
            // Draw result of wander logic is harder because wanderPoint was absolute. 
            // recalculate relative for drawing or just draw absolute
            pop();

            push();
            stroke(255, 50);
            noFill();
            // Circle center is at vel + pos
            let center = this.vel.copy().setMag(100).add(this.pos);
            circle(center.x, center.y, wanderRadius * 2);

            // Target
            line(this.pos.x, this.pos.y, center.x, center.y);
            fill(255, 0, 0);
            circle(wanderPoint.x, wanderPoint.y, 4);
            pop();
        }

        return steer;
    }

    // --- ADVANCED BEHAVIORS ---

    // Avoid obstacles (asteroids, walls, etc.) using Ray Casting / Projection - IMPROVED
    avoid(obstacles) {
        if (!obstacles || obstacles.length === 0) return createVector(0, 0);

        let maxSeeAhead = 250; // Detect obstacles further ahead (increased from 150)
        let ahead = this.vel.copy().setMag(maxSeeAhead);
        let aheadPos = p5.Vector.add(this.pos, ahead);

        let mostThreatening = null;
        let closestDistance = Infinity;

        // Debug: Draw the probe (ahead vector)
        if (typeof debugMode !== 'undefined' && debugMode) {
            push();
            stroke(100, 200, 0);
            line(this.pos.x, this.pos.y, aheadPos.x, aheadPos.y);
            circle(aheadPos.x, aheadPos.y, 5);
            pop();
        }

        // Find the closest obstacle in the path
        for (let obstacle of obstacles) {
            if (!obstacle || !obstacle.pos || !obstacle.r) continue;

            let distToObstacle = p5.Vector.dist(this.pos, obstacle.pos);

            // Only consider obstacles that are ahead and close enough
            if (distToObstacle > maxSeeAhead + obstacle.r + this.r + 30) continue;

            // Check if obstacle is in our path
            let vectorToObstacle = p5.Vector.sub(obstacle.pos, this.pos);
            
            // If velocity is zero, compute from acceleration instead
            let velDir = this.vel.mag() > 0 ? this.vel.copy().normalize() : this.acc.copy().normalize();
            if (velDir.mag() < 0.01) velDir = createVector(1, 0); // Default direction
            
            let projectionLength = vectorToObstacle.dot(velDir);

            // Is it behind us or too far ahead?
            if (projectionLength < -this.r) continue; // Behind us
            if (projectionLength > maxSeeAhead) continue; // Way too far ahead

            // Calculate perpendicular distance from our path to obstacle center
            let projectedPoint = this.pos.copy().add(velDir.copy().mult(projectionLength));
            let perpDistance = p5.Vector.dist(obstacle.pos, projectedPoint);

            // CRITICAL: Add buffer for avoidance
            let safetyMargin = obstacle.r + this.r + 20; // Increased from +10
            if (perpDistance < safetyMargin) {
                // This obstacle is in the way
                if (distToObstacle < closestDistance) {
                    closestDistance = distToObstacle;
                    mostThreatening = obstacle;
                }

                // Debug detection
                if (typeof debugMode !== 'undefined' && debugMode) {
                    push();
                    fill(255, 0, 0, 150);
                    noStroke();
                    circle(obstacle.pos.x, obstacle.pos.y, obstacle.r + 10);
                    pop();
                }
            }
        }

        // Calculate steering force
        if (mostThreatening) {
            let vectorToObstacle = p5.Vector.sub(mostThreatening.pos, this.pos);
            let velDir = this.vel.mag() > 0 ? this.vel.copy().normalize() : createVector(1, 0);
            let projectionLength = vectorToObstacle.dot(velDir);
            let projectedPoint = this.pos.copy().add(velDir.copy().mult(projectionLength));

            // Avoidance = steer away from obstacle perpendicular to our path
            let avoidanceForce = p5.Vector.sub(projectedPoint, mostThreatening.pos);
            avoidanceForce.normalize();
            avoidanceForce.mult(this.maxSpeed);
            
            // CRITICAL: Make avoidance much stronger and add braking
            let brakeFactor = 1.0 - Math.min(closestDistance / (mostThreatening.r + this.r + 50), 1.0);
            avoidanceForce.mult(1.0 + brakeFactor * 2.0); // Increase magnitude based on proximity
            
            avoidanceForce.limit(this.maxForce * 4.0); // Much stronger limit (was 2.5)

            // Debug Vector
            if (typeof debugMode !== 'undefined' && debugMode) {
                push();
                stroke(255, 0, 0);
                strokeWeight(3);
                line(this.pos.x, this.pos.y, this.pos.x + avoidanceForce.x * 50, this.pos.y + avoidanceForce.y * 50);
                pop();
            }

            return avoidanceForce;
        }

        return createVector(0, 0);
    }



    // Flocking Group Behavior
    flock(vehicles) {
        let sep = this.separate(vehicles);
        let ali = this.align(vehicles);
        let coh = this.cohesion(vehicles);

        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);

        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    separate(vehicles) {
        let desiredSeparation = 25;
        let sum = createVector();
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < desiredSeparation)) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                sum.add(diff);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);
            sum.sub(this.vel);
            sum.limit(this.maxForce);
        }
        return sum;
    }

    align(vehicles) {
        let neighborDist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < neighborDist)) {
                sum.add(other.vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    cohesion(vehicles) {
        let neighborDist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let other of vehicles) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if ((d > 0) && (d < neighborDist)) {
                sum.add(other.pos);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);
        }
        return createVector(0, 0);
    }
}
