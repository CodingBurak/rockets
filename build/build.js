"use strict";
var firework;
(function (firework) {
    class Client {
        constructor() {
            this.apiUrl = firework.localhostUrl;
        }
        async getAllRockets() {
            let settings = this.getHeaderSettings();
            try {
                const fetchResponse = await fetch(this.apiUrl + "rockets", settings);
                const data = await fetchResponse.json();
                return data;
            }
            catch (e) {
                throw Error(e);
            }
        }
        async postRocket(rockets) {
            let settings = this.getHeaderSettings('POST');
            try {
                const fetchResponse = await fetch(this.apiUrl + "rockets", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rockets)
                });
                const data = await fetchResponse.json();
                return data;
            }
            catch (e) {
                throw Error(e);
            }
        }
        getHeaderSettings(methodType = 'GET', body) {
            switch (methodType) {
                case 'POST':
                case 'PUT':
                    return {
                        method: methodType,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    };
                    break;
                default:
                    return {
                        method: methodType,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    };
            }
        }
    }
    firework.Client = Client;
})(firework || (firework = {}));
var firework;
(function (firework) {
    firework.localhostUrl = 'http://127.0.0.1:8081/api/';
    firework.herokuUrl = "";
})(firework || (firework = {}));
var firework;
(function (firework) {
    let Speed;
    (function (Speed) {
        Speed[Speed["SLOW"] = 1] = "SLOW";
        Speed[Speed["MIDDLE"] = 2] = "MIDDLE";
        Speed[Speed["FAST"] = 3] = "FAST";
    })(Speed = firework.Speed || (firework.Speed = {}));
    let ScatterSize;
    (function (ScatterSize) {
        ScatterSize[ScatterSize["SMALL"] = 0.87] = "SMALL";
        ScatterSize[ScatterSize["MEDIUM"] = 0.92] = "MEDIUM";
        ScatterSize[ScatterSize["LARGE"] = 0.96] = "LARGE";
    })(ScatterSize = firework.ScatterSize || (firework.ScatterSize = {}));
    let Color;
    (function (Color) {
        Color[Color["YELLOW"] = 60] = "YELLOW";
        Color[Color["GREEN"] = 120] = "GREEN";
        Color[Color["BLUE"] = 240] = "BLUE";
        Color[Color["RED"] = 0] = "RED";
    })(Color = firework.Color || (firework.Color = {}));
})(firework || (firework = {}));
var firework;
(function (firework) {
    let rockets = [];
    let allRockets = [];
    firework.allScatters = [];
    let selectedRocket;
    let mouseVector = { x: 400, y: 300 };
    const MAX_PARTICLES = 4000;
    let addButton;
    let testButton;
    let rocketName;
    let colorSlider;
    let secondColorSlider;
    let sizeSlider;
    let speedSlider;
    let colorOutput;
    let secondColorOutput;
    let sizeOutput;
    let speedOutput;
    let client;
    window.addEventListener("load", onPageLoad);
    function onPageLoad() {
        client = new firework.Client();
        colorSlider = document.getElementById("colorSlider");
        secondColorSlider = document.getElementById("secondColorSlider");
        rocketName = document.getElementById("rocketName");
        speedSlider = document.getElementById("speedSlider");
        sizeSlider = document.getElementById("sizeSlider");
        colorOutput = document.getElementById("colorOutput");
        colorOutput.innerHTML = colorSlider.value;
        secondColorOutput = document.getElementById("secondColorOutput");
        secondColorOutput.innerHTML = secondColorSlider.value;
        sizeOutput = document.getElementById("sizeOutput");
        sizeOutput.innerHTML = sizeSlider.value;
        speedOutput = document.getElementById("speedOutput");
        speedOutput.innerHTML = sizeSlider.value;
        colorSlider.oninput = function (event) {
            let target = event.target;
            colorOutput.innerHTML = target.value;
        };
        secondColorSlider.oninput = function (event) {
            let target = event.target;
            secondColorOutput.innerHTML = target.value;
        };
        speedSlider.oninput = function (event) {
            let target = event.target;
            speedOutput.innerHTML = target.value;
        };
        sizeSlider.oninput = function (event) {
            let target = event.target;
            sizeOutput.innerHTML = target.value;
        };
        addButton = document.getElementById("addRocket");
        testButton = document.getElementById("testRocket");
        firework.canvas = document.getElementById("canvas");
        if (!firework.canvas)
            return;
        firework.canvas.addEventListener("mousedown", launchRockets);
        addButton.addEventListener("click", postRocket);
        testButton.addEventListener("click", testRocket);
        firework.crc2 = firework.canvas.getContext("2d");
        firework.canvas.style.width = '100%';
        firework.canvas.style.height = '100%';
        // ...then set the internal size to match
        firework.canvas.width = firework.canvas.offsetWidth;
        firework.canvas.height = firework.canvas.offsetHeight;
        setBackground();
        getAllRockets();
        setInterval(gameLoop, 16);
    }
    function launchRockets(event) {
        for (let i = 0; i < allRockets.length; i++) {
            launchFrom(Math.random() * firework.canvas.width * 2 / 3 + firework.canvas.width / 6, allRockets[i]);
        }
    }
    function testRocket() {
        let testRocket = {
            name: rocketName.value,
            color: Number.parseInt(colorSlider.value),
            secondColor: Number.parseInt(secondColorSlider.value),
            size: Number.parseFloat(sizeSlider.value),
            speed: Number.parseInt(speedSlider.value)
        };
        launchFrom(300, testRocket);
    }
    function launchFrom(posX, rocketObj) {
        //if (allRockets.length < 5) {
        let pos = { x: posX, y: firework.canvas.height };
        let rocket = new firework.Rocket(pos, rocketObj);
        rocket.vel.y = Math.random() * -3 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rockets.push(rocket);
        //}
    }
    function gameLoop() {
        setBackground();
        let queueRockets = [];
        for (var i = 0; i < rockets.length; i++) {
            // update and render
            rockets[i].animate();
            //explode in the upper 80% of screen
            if (rockets[i].pos.y < firework.canvas.height * 0.2) {
                firework.allScatters.push(...rockets[i].createScatter());
            }
            else {
                queueRockets.push(rockets[i]);
            }
        }
        rockets = queueRockets;
        for (var i = 0; i < firework.allScatters.length; i++) {
            firework.allScatters[i].animate();
            // render and save particles that can be rendered
            ;
        }
    }
    async function getAllRockets() {
        allRockets = await client.getAllRockets();
    }
    async function postRocket() {
        let testRocket = {
            name: rocketName.value,
            color: Number.parseInt(colorSlider.value),
            secondColor: Number.parseInt(secondColorSlider.value),
            size: Number.parseFloat(sizeSlider.value),
            speed: Number.parseInt(speedSlider.value)
        };
        let posted = await client.postRocket(testRocket);
        allRockets = await client.getAllRockets();
        console.log(posted);
        return posted;
    }
    function setBackground() {
        firework.crc2.save();
        firework.crc2.fillStyle = "rgba(0, 0, 0, 0.15)";
        firework.crc2.fillRect(0, 0, firework.canvas.width, firework.canvas.height);
        var text = "Welcome!";
        firework.crc2.textAlign = "center";
        firework.crc2.fillStyle = "red";
        firework.crc2.font = "30px Comic Sans MS";
        firework.crc2.fillText(text, firework.canvas.width / 2, firework.canvas.height / 4);
    }
})(firework || (firework = {}));
var firework;
(function (firework) {
    class Moveable {
        constructor(v) {
            this.pos = { x: 0, y: 0 };
            this.vel = { x: 0, y: 0 };
            this.pos = v;
            this.alpha = 1;
        }
        exists() {
            return this.alpha >= 0.1 && this.size >= 1;
        }
    }
    firework.Moveable = Moveable;
})(firework || (firework = {}));
var firework;
(function (firework) {
    class Scatter extends firework.Moveable {
        constructor(pos) {
            super(pos);
            this.pos = {
                x: pos ? pos.x : 0,
                y: pos ? pos.y : 0
            };
            this.vel = {
                x: 0,
                y: 0
            };
            this.shrink = 0.98;
            this.size = 0;
            this.resistance = firework.ScatterSize.MEDIUM;
            this.gravity = 0.1;
            this.alpha = 1;
            this.fade = 0;
        }
        draw() {
            if (!this.exists()) {
                return;
            }
            firework.crc2.save();
            firework.crc2.globalCompositeOperation = 'lighter';
            let x = this.pos.x, y = this.pos.y, r = this.size / 2;
            let gradient = firework.crc2.createRadialGradient(x, y, 0.1, x, y, r);
            gradient.addColorStop(0.5, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
            gradient.addColorStop(1, "hsla(" + this.secondColor + ", 100%, 50%, " + this.alpha + ")");
            firework.crc2.fillStyle = gradient;
            firework.crc2.beginPath();
            firework.crc2.arc(x, y, r, 0, Math.PI * 2, true);
            firework.crc2.closePath();
            firework.crc2.fill();
            firework.crc2.restore();
        }
        update() {
            this.vel.x *= this.resistance;
            this.vel.y *= this.resistance;
            // gravity down
            this.vel.y += this.gravity;
            // update position based on speed
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            // shrink
            this.size *= this.shrink;
            // fade out
            this.alpha -= this.fade;
        }
        animate() {
            this.update();
            this.draw();
        }
    }
    firework.Scatter = Scatter;
})(firework || (firework = {}));
/// <reference path="scatter.ts" />
var firework;
(function (firework) {
    class Rocket extends firework.Moveable {
        constructor(v, rocketObj) {
            super(v);
            this.MAX_EXPLOSION = 100;
            this.MIN_EXPLOSION = 50;
            this.size = 4;
            this.scatterSize = rocketObj.size;
            this.speed = rocketObj.speed;
            this.color = rocketObj.color;
            this.secondColor = rocketObj.secondColor;
            this.scatters_ = [];
        }
        update() {
            // update position based on speed
            this.pos.x += this.vel.x * 1.5;
            this.pos.y += this.vel.y * this.speed;
        }
        draw() {
            if (!this.exists()) {
                return;
            }
            let x = this.pos.x, y = this.pos.y, r = this.size;
            var gradient = firework.crc2.createRadialGradient(x, y, 0.1, x, y, r);
            gradient.addColorStop(0.1, "rgba(255, 255, 0 ," + this.alpha + ")");
            gradient.addColorStop(1, "rgba(255, 0, 0, " + this.alpha + ")");
            firework.crc2.fillStyle = gradient;
            firework.crc2.beginPath();
            firework.crc2.arc(x, y, this.size, 0, Math.PI * 2, true);
            firework.crc2.closePath();
            firework.crc2.fill();
            firework.crc2.restore();
        }
        createScatter() {
            let count = Math.random() * this.MAX_EXPLOSION + this.MIN_EXPLOSION;
            //let scatters: Scatter[] = []
            for (let i = 0; i < count; i++) {
                let scatter = new firework.Scatter(this.pos);
                // area to fill the maximum angle
                let angle = Math.random() * Math.PI * 2;
                // emulate 3D effect by using cosine and put more particles in the middle
                let speed = Math.sin(Math.random() * Math.PI / 2) * 15;
                scatter.vel.x = Math.cos(angle) * speed;
                scatter.vel.y = Math.sin(angle) * speed;
                scatter.size = 4;
                scatter.resistance = this.scatterSize;
                scatter.color = this.color;
                scatter.secondColor = this.secondColor;
                this.scatters_.push(scatter);
            }
            return this.scatters_;
        }
        animate() {
            this.update();
            this.draw();
        }
    }
    firework.Rocket = Rocket;
})(firework || (firework = {}));
//# sourceMappingURL=build.js.map