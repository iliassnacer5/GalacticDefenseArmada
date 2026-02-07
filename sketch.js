let station;
let asteroids = [];
let interceptors = [];
let repairShips = [];
let drones = [];
let enemies = [];
let missiles = [];
let lasers = []; // Player projectiles (Cyan)
let droneLasers = []; // Drone projectiles (Yellow)
let interceptorLasers = []; // Friendly Interceptor projectiles (Green)
let enemyLasers = []; // Enemy projectiles (Red)
let walls = []; // Drone shields
let stars = []; // Background stars
let hero; // Player ship

let debugMode = false;
let waveCount = 0;
let waveTimer = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Create Station
    station = new Station(width / 2, height / 2);

    // Create Asteroids
    for (let i = 0; i < 5; i++) { // Less asteroids to make room for walls
        asteroids.push(new Asteroid(random(width), random(height), random(20, 50)));
    }

    // Stars
    for (let i = 0; i < 100; i++) {
        stars.push({ x: random(width), y: random(height), size: random(1, 3) });
    }

    // Initial Fleet
    for (let i = 0; i < 5; i++) {
        interceptors.push(new Interceptor(width / 2 + random(-100, 100), height / 2 + random(-100, 100)));
    }

    for (let i = 0; i < 3; i++) {
        drones.push(new Drone(width / 2 + random(-200, 200), height / 2 + random(-200, 200)));
    }

    repairShips.push(new RepairShip(width / 2 + 50, height / 2 + 50));

    // Create Hero
    hero = new Hero(mouseX, mouseY);
}

function draw() {
    // Starfield Background
    background(10, 10, 20); // Dark Blue

    // Draw Stars
    noStroke();
    fill(255);
    for (let s of stars) {
        circle(s.x, s.y, s.size);
    }

    // --- UPDATE & SHOW ENVIRONMENT ---
    station.show();

    // Walls (Shields)
    for (let i = walls.length - 1; i >= 0; i--) {
        walls[i].update();
        walls[i].show();
        if (walls[i].life <= 0) {
            walls.splice(i, 1);
        }
    }

    asteroids.forEach(a => {
        a.update();
        a.show();
    });

    // --- HERO ---
    hero.update();
    hero.show();

    // Lasers (Player)
    for (let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].update();
        lasers[i].show();

        if (lasers[i].toDelete) {
            lasers.splice(i, 1);
            continue;
        }

        // Laser vs Enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (p5.Vector.dist(lasers[i].pos, enemies[j].pos) < enemies[j].r + 5) {
                enemies.splice(j, 1); // Kill enemy
                lasers[i].toDelete = true;
                break;
            }
        }
    }

    // Drone Lasers (AI)
    for (let i = droneLasers.length - 1; i >= 0; i--) {
        droneLasers[i].update();
        // Draw slightly different (Yellow)
        push();
        stroke(255, 255, 0);
        strokeWeight(3);
        line(droneLasers[i].pos.x, droneLasers[i].pos.y, droneLasers[i].pos.x - droneLasers[i].vel.x, droneLasers[i].pos.y - droneLasers[i].vel.y);
        pop();

        if (droneLasers[i].toDelete) {
            droneLasers.splice(i, 1);
            continue;
        }

        // Laser vs Enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (p5.Vector.dist(droneLasers[i].pos, enemies[j].pos) < enemies[j].r + 5) {
                enemies.splice(j, 1); // Kill enemy
                droneLasers[i].toDelete = true;
                break;
            }
        }
    }

    // Interceptor Lasers (Green)
    for (let i = interceptorLasers.length - 1; i >= 0; i--) {
        interceptorLasers[i].update();
        interceptorLasers[i].show();
        if (interceptorLasers[i].toDelete) {
            interceptorLasers.splice(i, 1);
            continue;
        }
        // Vs Enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (p5.Vector.dist(interceptorLasers[i].pos, enemies[j].pos) < enemies[j].r + 5) {
                enemies.splice(j, 1);
                interceptorLasers[i].toDelete = true;
                break;
            }
        }
    }

    // Enemy Lasers (Red)
    for (let i = enemyLasers.length - 1; i >= 0; i--) {
        enemyLasers[i].update();
        enemyLasers[i].show();
        if (enemyLasers[i].toDelete) {
            enemyLasers.splice(i, 1);
            continue;
        }

        // Vs Hero
        if (p5.Vector.dist(enemyLasers[i].pos, hero.pos) < hero.r) {
            // Hero Hit (maybe flash screen or reduce score? For now just delete laser)
            enemyLasers[i].toDelete = true;
            // TODO: Add Hero Health
        }

        // Vs Station
        if (p5.Vector.dist(enemyLasers[i].pos, station.pos) < station.r) {
            station.takeDamage(20);
            enemyLasers[i].toDelete = true;
        }

        // Vs Interceptors
        for (let j = interceptors.length - 1; j >= 0; j--) {
            if (p5.Vector.dist(enemyLasers[i].pos, interceptors[j].pos) < interceptors[j].r + 5) {
                interceptors.splice(j, 1); // Kill interceptor
                enemyLasers[i].toDelete = true;
                break;
            }
        }
    }

    // --- WAVE MANAGEMENT ---
    // Simple wave system: spawn enemies every 5 seconds
    if (millis() - waveTimer > 5000) {
        spawnWave();
        waveTimer = millis();

        // Reinforcements: If 2 or fewer interceptors (green), spawn more!
        while (interceptors.length <= 2) {
            interceptors.push(new Interceptor(station.pos.x, station.pos.y));
        }
    }

    // --- UPDATE & SHOW AGENTS ---

    // Interceptors
    for (let i = interceptors.length - 1; i >= 0; i--) {
        let ship = interceptors[i];
        ship.hunt(enemies); // SEEK enemies

        let sepForce = ship.separate(interceptors); // FLOCK separation inherited
        ship.applyForce(sepForce);

        // Avoid asteroids
        let avoidForce = ship.avoid(asteroids);
        ship.applyForce(avoidForce);

        ship.edges(); // Keep in bounds (or bounce)

        // Fire logic
        let projectile = ship.autoFire(enemies);
        if (projectile) {
            interceptorLasers.push(projectile);
        }

        ship.update();
        ship.show();

        if (debugMode) {
            push();
            translate(ship.pos.x, ship.pos.y);

            // Velocity (Green)
            stroke(0, 255, 0);
            line(0, 0, ship.vel.x * 10, ship.vel.y * 10);

            // Perception Radius (White circle)
            noFill();
            stroke(255, 50);
            circle(0, 0, ship.r * 4); // Arbitrary perception range visual
            pop();
        }
    }

    // Drones
    for (let drone of drones) {
        let shield = drone.patrol(); // WANDER + Shield chance
        if (shield) {
            walls.push(shield); // Add new shield
        }

        // Auto-Fire
        let projectile = drone.autoFire(enemies);
        if (projectile) {
            droneLasers.push(projectile);
        }

        drone.flock(drones); // FLOCKING (inherited)

        // Avoid asteroids and walls
        let avoidAst = drone.avoid(asteroids);
        drone.applyForce(avoidAst);

        let avoidWalls = drone.avoid(walls);
        drone.applyForce(avoidWalls);

        drone.edges();
        drone.update();
        drone.show();
    }

    // Repair Ships
    for (let ship of repairShips) {
        // If station is damaged, go to it (ARRIVE), else wander
        if (station.health < 1000) {
            ship.returnToBase(station, asteroids); // Pass asteroids for avoidance
        } else {
            // Wander around station
            let center = createVector(width / 2, height / 2);
            if (p5.Vector.dist(ship.pos, center) > 300) {
                ship.applyForce(ship.seek(center));
            } else {
                ship.applyForce(ship.wander());
            }
        }

        let avoidAst = ship.avoid(asteroids);
        ship.applyForce(avoidAst);
        ship.update();
        ship.show();

        // Repair logic
        if (p5.Vector.dist(ship.pos, station.pos) < station.r) {
            station.health += 1;
        }
    }

    // Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.attack(station, walls); // SEEK station + AVOID walls

        // Separation from other enemies
        let sepForce = enemy.separate(enemies);
        enemy.applyForce(sepForce);

        // Avoid asteroids and walls
        let avoidAst = enemy.avoid(asteroids);
        enemy.applyForce(avoidAst);

        let avoidWalls = enemy.avoid(walls);
        enemy.applyForce(avoidWalls);

        // Enemy Fire
        let projectile = enemy.autoFire([station, hero]);
        if (projectile) {
            enemyLasers.push(projectile);
        }

        enemy.update();
        enemy.show();

        // Collision with station
        if (p5.Vector.dist(enemy.pos, station.pos) < station.r + enemy.r) {
            station.takeDamage(enemy.damage);
            enemies.splice(i, 1);
            continue;
        }

        // Collision with HERO (Mouse)
        if (p5.Vector.dist(enemy.pos, hero.pos) < hero.r * 2 + enemy.r) {
            enemies.splice(i, 1);
            // Could add score here
            continue;
        }

        // Collision with interceptors (simple combat)
        for (let interceptor of interceptors) {
            if (p5.Vector.dist(enemy.pos, interceptor.pos) < enemy.r + interceptor.r) {
                enemies.splice(i, 1);
                // interceptor could take damage too
                break;
            }
        }
    }

    // Missiles
    // Not implemented in spawn yet, but logic is ready
    // Generic Debug Draw Function
    if (debugMode) {
        // Draw debug for Drones
        drones.forEach(d => drawDebug(d, "yellow"));
        // Draw debug for Enemies
        enemies.forEach(e => drawDebug(e, "red"));
        // Draw debug for RepairShrps
        repairShips.forEach(r => drawDebug(r, "cyan"));
        // Draw debug for Hero
        drawDebug(hero, "white");
    }
}

function drawDebug(agent, colorLabel) {
    push();
    translate(agent.pos.x, agent.pos.y);

    // Velocity Vector (Green)
    stroke(0, 255, 0);
    line(0, 0, agent.vel.x * 10, agent.vel.y * 10);

    // Acceleration Vector (Yellow) - usually 0 at end of frame but useful if drawn before update
    stroke(255, 255, 0);
    line(0, 0, agent.acc.x * 100, agent.acc.y * 100);

    // Hitbox/Perception (Weak circle)
    noFill();
    stroke(255, 100);
    circle(0, 0, agent.r * 2);

    pop();
}

function spawnWave() {
    waveCount++;
    let count = floor(waveCount * 1.5) + 3;

    for (let i = 0; i < count; i++) {
        // Spawn from edges
        let x, y;
        if (random() < 0.5) {
            x = random() < 0.5 ? -20 : width + 20;
            y = random(height);
        } else {
            x = random(width);
            y = random() < 0.5 ? -20 : height + 20;
        }
        enemies.push(new Enemy(x, y));
    }
}

function mousePressed() {
    lasers.push(hero.shoot());
}

function keyPressed() {
    if (key === 'd' || key === 'D') {
        debugMode = !debugMode;
        // Toggle debug flag in agents if implemented
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    station.pos.set(width / 2, height / 2);
}
