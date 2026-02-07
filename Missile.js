class Missile extends Vehicule {
    constructor(x, y, target) {
        super(x, y);
        this.target = target; // The Station
        this.maxSpeed = 8;
        this.maxForce = 0.5;
        this.color = "#FFA500"; // Orange
        this.r = 4;
        this.life = 100;
    }

    update() {
        super.update();
        this.life -= 0.5;
        if (this.life <= 0) {
            // Explode
        }
    }

    run() {
        if (this.target) {
            let force = this.seek(this.target.pos);
            this.applyForce(force);
        }
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        fill(this.color);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, 10, 4);
        pop();
    }
}
