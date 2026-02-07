class Interceptor extends Vehicule {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 6;
        this.maxForce = 0.3;
        this.color = "#00FF00"; // Green
        this.r = 10;
        this.cooldown = 0;
    }

    hunt(enemies) {
        // Find closest enemy and seek it
        let closest = null;
        let closestD = Infinity;

        for (let enemy of enemies) {
            let d = p5.Vector.dist(this.pos, enemy.pos);
            if (d < closestD) {
                closestD = d;
                closest = enemy;
            }
        }

        if (closest) {
            let force = this.seek(closest.pos);
            this.applyForce(force);
        } else {
            this.applyForce(this.wander()); // Wander if no enemies
        }
    }

    autoFire(enemies) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return null;
        }

        // Find closest enemy to shoot
        let closest = null;
        let closestD = 250; // Range

        for (let enemy of enemies) {
            let d = p5.Vector.dist(this.pos, enemy.pos);
            if (d < closestD) {
                closestD = d;
                closest = enemy;
            }
        }

        if (closest) {
            // Check if facing roughly towards enemy
            let desired = p5.Vector.sub(closest.pos, this.pos);
            let diff = abs(desired.heading() - this.vel.heading());

            if (diff < PI / 3) {
                this.cooldown = 20; // Fast fire rate
                let laser = new Laser(this.pos, this.vel.heading());
                laser.color = "#00FF00"; // Green laser
                return laser;
            }
        }
        return null;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Starfighter Design (X-Wing style wings)
        strokeWeight(2);
        stroke(0, 255, 0);
        fill(20);

        // Body
        beginShape();
        vertex(this.r * 1.5, 0);
        vertex(-this.r, -this.r / 2);
        vertex(-this.r / 2, 0);
        vertex(-this.r, this.r / 2);
        endShape(CLOSE);

        // Wings
        line(-this.r / 2, 0, -this.r, -this.r);
        line(-this.r / 2, 0, -this.r, this.r);

        // Engine
        stroke(0, 255, 255);
        point(-this.r, 0);

        pop();
    }


}
