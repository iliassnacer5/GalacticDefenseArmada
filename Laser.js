class Laser extends Vehicule {
    constructor(pos, angle) {
        super(pos.x, pos.y);
        this.vel = p5.Vector.fromAngle(angle);
        this.vel.mult(15);
        this.maxSpeed = 15; // Override default limit

        this.life = 60; // Frames to live
        this.toDelete = false;
        this.color = "#00FFFF"; // Default cyan laser
    }

    update() {
        super.update();
        this.life--;
        if (this.life < 0) {
            this.toDelete = true;
        }
    }

    show() {
        push();
        stroke(this.color || "#00FFFF"); // Default or custom color
        strokeWeight(4);
        line(this.pos.x, this.pos.y, this.pos.x - this.vel.x, this.pos.y - this.vel.y);
        pop();
    }
}
