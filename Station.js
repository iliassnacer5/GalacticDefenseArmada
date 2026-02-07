class Station {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.r = 60;
        this.health = 1000;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        stroke(0, 255, 255);
        strokeWeight(2);
        noFill();

        // Outer ring
        circle(0, 0, this.r * 2);

        // Rotating inner part
        rotate(frameCount * 0.01);
        rectMode(CENTER);
        rect(0, 0, this.r, this.r);

        // Health bar
        pop();

        // Draw Health
        push();
        translate(this.pos.x - 50, this.pos.y + 80);
        fill(50);
        rect(0, 0, 100, 10);
        fill(0, 255, 0);
        rect(0, 0, map(this.health, 0, 1000, 0, 100), 10);
        pop();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }
}
