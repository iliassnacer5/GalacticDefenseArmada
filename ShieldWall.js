class ShieldWall {
    constructor(x, y, w, h) {
        this.pos = createVector(x, y);
        this.w = w;
        this.h = h;
        this.r = w; // Compatibility for avoid()
        this.life = 300; // Lasts 5 seconds
        this.maxLife = 300;
    }

    update() {
        this.life--;
    }

    show() {
        push();
        rectMode(CENTER);
        let alpha = map(this.life, 0, this.maxLife, 0, 200);
        fill(0, 100, 255, alpha);
        stroke(0, 200, 255, alpha);
        strokeWeight(2);
        translate(this.pos.x, this.pos.y);
        rect(0, 0, this.w, this.h);
        pop();
    }
}
