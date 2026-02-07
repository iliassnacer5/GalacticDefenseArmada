class Asteroid extends Vehicule {
    constructor(x, y, r) {
        super(x, y);
        this.r = r;
        this.vel = p5.Vector.random2D().mult(random(0.2, 1));

        this.vertexOffsets = [];
        let totalPoints = floor(random(5, 15));
        for (let i = 0; i < totalPoints; i++) {
            this.vertexOffsets.push(random(-r * 0.2, r * 0.2));
        }
    }

    update() {
        super.update(); // Use Vehicule Physics
        super.edges();  // Use Vehicule Wrapping
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        stroke(150);
        strokeWeight(2);
        noFill();
        beginShape();
        let angleStep = TWO_PI / this.vertexOffsets.length;
        for (let i = 0; i < this.vertexOffsets.length; i++) {
            let r = this.r + this.vertexOffsets[i];
            let angle = i * angleStep;
            vertex(r * cos(angle), r * sin(angle));
        }
        endShape(CLOSE);
        pop();
    }
}
