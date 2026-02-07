class Hero extends Vehicule {
    constructor(x, y) {
        super(x, y);
        this.r = 20; // Bigger than others
        this.color = "#FFFFFF"; // White
    }

    update() {
        // Override physics to follow mouse directly (or use loose seek)
        // Direct control:
        this.pos.x = mouseX;
        this.pos.y = mouseY;

        // Calculate "fake" velocity for rotation purposes
        this.vel = createVector(mouseX - pmouseX, mouseY - pmouseY);
    }

    shoot() {
        // Create a laser in the direction of velocity (or mouse)
        // Adjust position to be at the "nose" of the ship
        let shootPos = this.pos.copy().add(this.vel.copy().setMag(this.r));
        return new Laser(shootPos, this.vel.heading());
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        // Rotate based on movement
        if (this.vel.mag() > 0.1) {
            rotate(this.vel.heading());
        }

        // Star Wars style X-Wing-ish vibe
        strokeWeight(2);
        stroke(255);
        fill(20);

        // Body
        triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r * 1.5, 0);

        // Engine glow
        noStroke();
        fill(0, 200, 255, 150);
        circle(-this.r, 0, 10);

        pop();
    }
}
