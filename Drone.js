
class Drone extends Vehicule {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 3; // Slower but deadlier
        this.maxForce = 0.1;
        this.color = "#FFFF00";
        this.r = 15; // Bigger
        this.cooldown = 0; // Fire rate control
    }

    patrol() {
        this.applyForce(this.wander());

        // Shield chance (reduced since they now shoot)
        if (random() < 0.002) {
            return new ShieldWall(this.pos.x, this.pos.y, 80, 20);
        }
        return null;
    }

    // New Combat Behavior
    autoFire(enemies) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return null;
        }

        // Find nearest enemy
        let nearest = null;
        let record = 200; // Range of fire

        for (let enemy of enemies) {
            let d = p5.Vector.dist(this.pos, enemy.pos);
            if (d < record) {
                record = d;
                nearest = enemy;
            }
        }

        // Shoot if enemy exists and is relatively in front
        if (nearest != null) {
            // Check angle (dot product) to see if facing enemy
            let desired = p5.Vector.sub(nearest.pos, this.pos);
            let heading = this.vel.heading();
            let angle = desired.heading();
            let diff = abs(angle - heading);

            // Allow loose aiming
            if (diff < PI / 4) {
                this.cooldown = 60; // Fire every 1 second
                let laser = new Laser(this.pos, angle);
                laser.vel.mult(0.8); // Slower than hero laser
                return laser;
            }
        }
        return null;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // "War Drone" Design
        stroke(255, 200, 0); // Gold/Yellow
        strokeWeight(2);
        fill(20);

        // Central Body
        rectMode(CENTER);
        rect(0, 0, 20, 10);

        // Gun turrets (front)
        line(10, -5, 15, -5);
        line(10, 5, 15, 5);

        // Rotors/Engines (Sci-fi floating bits)
        noFill();
        stroke(0, 255, 255);
        circle(-10, -10, 8);
        circle(-10, 10, 8);
        circle(10, -10, 8);
        circle(10, 10, 8);

        // Center scanning eye
        fill(255, 0, 0);
        noStroke();
        circle(5, 0, 4);

        pop();
    }


}
