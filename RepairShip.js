class RepairShip extends Vehicule {
    constructor(x, y) {
        super(x, y);
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        this.color = "#00FFFF"; // Cyan
        this.r = 12;
    }

    show() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        // Support Ship Design (Bulky, round, industrial)
        strokeWeight(2);
        stroke(0, 255, 255);
        fill(0, 50, 50);

        // Main hull (Circle)
        ellipse(0, 0, this.r * 2, this.r * 1.5);

        // Repair Arms
        line(-5, -5, -this.r, -this.r);
        line(-5, 5, -this.r, this.r);
        fill(0, 255, 255);
        circle(-this.r, -this.r, 3);
        circle(-this.r, this.r, 3);

        // Medic Cross
        stroke(255);
        line(-4, 0, 4, 0);
        line(0, -4, 0, 4);

        pop();
    }

    returnToBase(station, asteroids) { // Added asteroids param
        // 1. Arrive at station
        let force = this.arrive(station.pos);
        this.applyForce(force);

        // 2. Avoid asteroids using inherrited method
        let avoidForce = this.avoid(asteroids);
        avoidForce.mult(3); // High priority
        this.applyForce(avoidForce);
    }
}
