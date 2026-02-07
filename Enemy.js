class Enemy extends Vehicule {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 3;
        this.maxForce = 0.15;
        this.color = "#FF0000"; // Red
        this.r = 15;
        this.damage = 10;
        this.cooldown = 0;
    }

    attack(target, walls) {
        let force = this.seek(target.pos);
        this.applyForce(force);

        // Use inherited avoid for walls
        let avoidForce = this.avoid(walls);
        avoidForce.mult(5);
        this.applyForce(avoidForce);
    }

    autoFire(targets) { // targets = [station, hero]
        if (this.cooldown > 0) {
            this.cooldown--;
            return null;
        }

        // Pick a target in range
        for (let t of targets) {
            if (p5.Vector.dist(this.pos, t.pos) < 300) {
                // Shoot at it
                this.cooldown = 80; // Slow but heavy

                let angle = p5.Vector.sub(t.pos, this.pos).heading();
                let laser = new Laser(this.pos, angle);
                laser.color = "#FF0000"; // Red laser
                laser.vel.mult(0.6); // Slow projectile
                return laser;
            }
        }
        return null;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Alien Ship Design (Spiky, aggressive)
        strokeWeight(2);
        stroke(255, 0, 0);
        fill(30, 0, 0);

        // Main hull (Diamond shape)
        beginShape();
        vertex(this.r, 0);
        vertex(0, -this.r / 1.5);
        vertex(-this.r, 0);
        vertex(0, this.r / 1.5);
        endShape(CLOSE);

        // Spikes/Mandibles
        line(0, -this.r / 1.5, this.r, -this.r);
        line(0, this.r / 1.5, this.r, this.r);

        // Core Glow
        fill(255, 0, 0, 200);
        noStroke();
        circle(0, 0, 6);

        pop();
    }




}
