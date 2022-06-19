// noinspection DuplicatedCode

let POWER_INCREASE_INTERVAL;
let AWAITING_NEW_ROUND;
let POWER = 0;

(() => {
    for (const i of Object.keys(scoreTerms).sort((a, b) => b - a)) {
        scoreTerms[i].count = 0;
        const elem = document.querySelector("#scoring > div");
        elem.insertBefore(document.createElement("p"), elem.firstChild);
        elem.children[0].innerText = `${scoreTerms[i].name} (${i > 0 ? "+" : ""}${Number(i)})`;
        elem.children[0].setAttribute("data-score", `s${String(i)}`);
        if (scoreTerms[i].animation !== undefined) {
            elem.children[0].style.animationName = camelCase(scoreTerms[i].name);
            elem.children[0].style.animationDuration = `${scoreTerms[i].animation}s`;
        } else {
            elem.children[0].style.color = scoreTerms[i].col;
        }
        elem.children[0].style.opacity = "0";
        if (i < 0) elem.children[0].style.filter = `drop-shadow(0 0 ${-i}px ${scoreTerms[i].col})`;
    }
})();

class obstacle {
    constructor(x, y, rot) {
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.height = 8;
        this.width = 200;
        this.type = "wall";
    }
}

class trap extends obstacle {
    constructor(x, y, rot, height, width, type) {
        super(x, y, rot);
        this.height = height;
        this.width = width;
        this.type = type === undefined ? "trap" : type;
    }
}

class ice extends trap {
    constructor(x, y, rot, height, width) {
        super(x, y, rot, height, width);
        this.type = "ice";
    }
}

class gameRound {
    constructor({par, holeX, holeY, startX, startY, windX, windY}) {
        if (par !== undefined) {
            this.par = par;
        } else {
            const foo = (Math.abs(startY - holeY) ** 2 + Math.abs(startX - holeX) ** 2) ** 0.5;
            this.par = (foo / 50) ** 0.5 / 2;
        }
        this.par = Math.round(this.par);
        this.holeX = holeX;
        this.holeY = holeY;
        this.startX = startX;
        this.startY = startY;
        this.wind = {x: windX, y: windY};
        game.ball.x = this.startX;
        game.ball.y = this.startY;
        this.strokes = 0;
        document.querySelector("#info > b > span:nth-child(3)").innerText = `Par: ${this.par} | `;
        this.windDir = -Math.atan2(this.wind.x, this.wind.y) * (180 / Math.PI) + 180;

        function toDirection(deg) {
            deg = ~~((deg + 11.25) / 22.5) % 16;
            const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
            return arr[deg];
        }

        document.querySelector("#info > b > span:nth-child(7)").innerText = `Wind: ${((this.wind.x ** 2 + this.wind.y ** 2) ** 0.5 * 5).toLocaleString()} m/s ${toDirection(this.windDir)}`;
    }
}

let game = {
    rounds: 0,
    currentRound: 0,
    ball: {
        x: 0,
        y: 0,
        z: 0,
        velX: 0,
        velY: 0,
        velZ: 0
    },
    cameraX: 0,
    cameraY: 0,
    score: 0,
    bestScore: 0,
    physics: {
        friction: 0.02,
        maxPower: 100,
        minPower: 0,
        gravity: 1
    },
    obstacles: []
};

function newRound() {
    game.ball.velX = 0;
    game.ball.velY = 0;
    document.querySelector("#info > b > span").innerText = `Score: ${game.score > 0 ? `+${game.score}` : game.score} / ${game.rounds}`;
    document.querySelector("#info > b > span").style.color = "#000";
    document.querySelector("#info > b > span").style.animationName = "";
    document.querySelector("#info > b > span").style.filter = ``;
    document.querySelector("#info > b > span:nth-child(4)").innerText = "Strokes: 0";
    AWAITING_NEW_ROUND = false;
    game.currentRound = new gameRound({
        holeX: Math.random() * 250 * game.rounds,
        holeY: Math.random() * 250 * game.rounds,
        startX: Math.random() * 250 * game.rounds,
        startY: Math.random() * 250 * game.rounds,
        windX: Math.random() / 20 * game.rounds - Math.random() / 40 * game.rounds,
        windY: Math.random() / 20 * game.rounds - Math.random() / 40 * game.rounds
    });
    game.obstacles = [];
    for (let i = 0; i < Math.random() * 15; i++) {
        // game.obstacles.push(new obstacle(Math.random() * 2500, Math.random() * 2500, Math.random() * 360));
        game.obstacles.push(new trap(Math.random() * 2500, Math.random() * 2500, Math.random() * 360, Math.random() * 400, Math.random() * 400));
        game.obstacles.push(new ice(Math.random() * 2500, Math.random() * 2500, Math.random() * 360, Math.random() * 400, Math.random() * 400));
    }
    game.rounds++;
}

newRound();

function showScore(s, strokes) {
    game.score += s;
    s = stats(Object.keys(scoreTerms), s).firstBelow;
    scoreTerms[s].count++;
    const elem = document.querySelector("#info > b > span");
    elem.innerText = `${scoreTerms[s].name} (${s > 0 ? "+" : ""}${s})${strokes === 1 ? " (HI1)" : strokes === 0 ? " (HI0)" : ""}`;
    if (scoreTerms[s].animation !== undefined) {
        elem.style.animationName = camelCase(scoreTerms[s].name);
        elem.style.animationDuration = `${scoreTerms[s].animation}s`;
    } else {
        elem.style.color = scoreTerms[s].col;
    }
    /* if (s < 0) {
        elem.style.filter = `drop-shadow(0 0 ${-s}px ${scoreTerms[s].col})`;
        game.physics.maxPower *= 1 + 0.01 * -s;
    } */
    if (document.querySelector(`#scoring > div > p[data-score=s${s}]`).style.opacity !== "1") {
        document.querySelector("#scoring").scrollTop = document.querySelector(`#scoring > div > p[data-score=s${s}]`).offsetTop;
    }
    document.querySelector(`#scoring > div > p[data-score=s${s}]`).style.opacity = "1";
    document.querySelector(`#scoring > div > p[data-score=s${s}]`).innerText = `${scoreTerms[s].name} (${s > 0 ? "+" : ""}${s}) x${scoreTerms[s].count}`;
}

function overlapping(elem1, elem2) {
    elem1 = elem1.getBoundingClientRect();
    elem2 = elem2.getBoundingClientRect();
    return !(elem1.right < elem2.left || elem1.left > elem2.right || elem1.bottom < elem2.top || elem1.top > elem2.bottom);
}

function gameLoop() {
    game.cameraX = window.innerWidth / 2 - game.ball.x;
    game.cameraY = window.innerHeight / 2 - game.ball.y;
    let friction2 = game.physics.friction;
    if (game.ball.z > 0) friction2 = 0;

    function fixNum(n) {
        n = isNaN(n) ? 0 : n;
        return n;
    }

    const elem = document.querySelector("#obstacles");
    elem.innerHTML = "";
    const {obstacles, ball, cameraY, cameraX} = game;
    for (const i in obstacles) {
        elem.append(document.createElement("div"));
        elem.children[i].className = "obstacle";
        const {width, rot, height, y, x, type} = obstacles[i];
        if (type === "wall") {
            elem.children[i].style.background = "#af8353";
        } else if (type === "trap") {
            elem.children[i].style.background = "url(sand.png), #ffe4a3";
        } else if (type === "ice") {
            elem.children[i].style.background = "#a6f8eb";
        }
        elem.children[i].style.height = `${height}px`;
        elem.children[i].style.width = `${width}px`;
        elem.children[i].style.left = `${x + cameraX}px`;
        elem.children[i].style.top = `${y + cameraY}px`;
        elem.children[i].style.transform = `rotate(${rot}deg)`;
        if (overlapping(elem.children[i], document.querySelector("#ball"))) {
            if (type === "wall") {
                ball.velX *= -0.5;
                ball.velY *= -0.5;
            } else if (type === "trap") {
                friction2 *= 50;
            } else if (type === "ice") {
                friction2 /= 40;
            }
        }
    }

    game.ball.x += game.ball.velX;
    game.ball.y += game.ball.velY;
    game.ball.z += game.ball.velZ;
    if (game.ball.z < 0) game.ball.z = 0;
    const totalVelocity = Math.sqrt(fixNum(Math.abs(friction2 / (game.ball.velX ** 2 + game.ball.velY ** 2) ** 1.5)));
    if (game.ball.z > 0) {
        game.ball.velX += game.currentRound.wind.x / 5;
        game.ball.velY += game.currentRound.wind.y / 5;
    }
    game.ball.velX /= totalVelocity ** 0.75 + 1;
    game.ball.velY /= totalVelocity ** 0.75 + 1;
    game.ball.velZ -= 0.1 * game.physics.gravity;
    document.querySelector("#holeLocationDiv > span").innerText = `${Math.round(((game.currentRound.holeX - game.ball.x) ** 2 + (game.currentRound.holeY - game.ball.y) ** 2) ** 0.5 / 30).toLocaleString()}m`;
    document.querySelector("#ball").style.left = `${game.ball.x + game.cameraX}px`;
    document.querySelector("#ball").style.top = `${game.ball.y + game.cameraY}px`;
    document.querySelector("#ball").style.filter = `drop-shadow(${game.ball.z}px ${game.ball.z}px ${game.ball.z / 4}px #000)`;
    document.querySelector("#ball").style.transform = `scale(${game.ball.z / 100 + 1}) translateX(-1vw) translateY(-1vw)`;
    document.querySelector("div.hole").style.left = `${game.currentRound.holeX + game.cameraX}px`;
    document.querySelector("div.hole").style.top = `${game.currentRound.holeY + game.cameraY}px`;

    const radians = Math.atan2(game.currentRound.holeX - game.ball.x, game.currentRound.holeY - game.ball.y);
    const degrees = -radians * (180 / Math.PI) + 180;
    document.querySelector("#holeLocationDiv").style.transform = `rotate(${degrees}deg)`;
    document.querySelector("#holeLocationDiv > span").style.transform = `rotate(${-degrees}deg)`;
    document.body.style.backgroundPosition = `${game.cameraX}px ${game.cameraY}px`;
    if (overlapping(document.querySelector("#ball"), document.querySelector(".hole")) && Math.sqrt(game.ball.velX ** 2 + game.ball.velX ** 2) < 10 && game.ball.z === 0) {
        game.ball.velX = (game.currentRound.holeX - game.ball.x) / 5;
        game.ball.velY = (game.currentRound.holeY - game.ball.y) / 5;
        game.ball.velX /= 2;
        game.ball.velY /= 2;
        if (!AWAITING_NEW_ROUND) {
            showScore(game.currentRound.strokes - game.currentRound.par, game.currentRound.strokes);
            AWAITING_NEW_ROUND = true;
            setTimeout(newRound, 1000);
        }
    }
    shake(document.querySelector("#info > b > span:nth-child(5)"), Math.sqrt(POWER / 10));
}

setInterval(gameLoop, 20);

document.onmousemove = e => {
    // make aim arrow face mouse
    const radians = Math.atan2(e.clientX - game.ball.x - game.cameraX, e.clientY - game.ball.y - game.cameraY);
    const degrees = radians * (180 / Math.PI) * -1 + 90;
    document.querySelector("#aimArrow").style.transform = `rotate(${degrees}deg)`;
}

document.onmousedown = () => {
    if (!AWAITING_NEW_ROUND) {
        const {maxPower, minPower} = game.physics;
        POWER = minPower;
        clearInterval(POWER_INCREASE_INTERVAL);
        if (game.ball.velX === 0 && game.ball.velY === 0) {
            POWER_INCREASE_INTERVAL = setInterval(() => {
                POWER += 0.005 * (maxPower - minPower);
                if (POWER > maxPower) POWER = maxPower;
                document.querySelector("#power").style.width = `${(POWER / (maxPower - minPower) + minPower) * 50}vw`;
                document.querySelector("#power").style.background = `hsl(${(POWER / (maxPower - minPower) + minPower) * -100 + 120}, 100%, 50%)`;
                document.querySelector("#info > b > span:nth-child(5)").innerText = `Power: ${Math.round(POWER).toLocaleString()}`;
            });
        }
    }
}

document.onmouseup = e => {
    if (game.ball.velX === 0 && game.ball.velY === 0 && POWER_INCREASE_INTERVAL !== undefined) {
        game.currentRound.strokes++;
        let x = e.clientX - game.ball.x - game.cameraX;
        let y = e.clientY - game.ball.y - game.cameraY;
        const dist = (x ** 2 + y ** 2) ** 0.5;
        x /= dist;
        y /= dist;
        game.ball.velX = x / (5 / POWER);
        game.ball.velY = y / (5 / POWER);
        if (e.shiftKey) game.ball.velZ = POWER / 20;
        document.querySelector("#info > b > span:nth-child(4)").innerText = `Strokes: ${game.currentRound.strokes}`;
        POWER = game.physics.minPower;
    }
    clearInterval(POWER_INCREASE_INTERVAL);
    POWER_INCREASE_INTERVAL = undefined;
}
