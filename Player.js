import Utils from './Utils.js';
import Node from './Node.js';
import Seed from "./Seed.js";
import WaterWell from "./WaterWell.js";

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Player extends Node {

    constructor(mesh, image, options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.mesh = mesh;
        this.image = image;


        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    update(dt, scene, builder, renderer) {
        const c = this;
        const p = this.children[0];

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA']) {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }

        // 5: put flower in front of player
        if (this.keys['KeyF']) {
            this.actionKeyFunctions(scene, builder, renderer);
        }
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const p = this;
        const c = this.children[0];

        c.rotation[0] -= dy * c.mouseSensitivity;
        p.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const cLimitUp = pi/5;
        const cLimitDown = pi/4;

        if (c.rotation[0] > cLimitUp) {
            c.rotation[0] = cLimitUp;
        }
        if (c.rotation[0] < -cLimitDown) {
            c.rotation[0] = -cLimitDown;
        }

        p.rotation[1] = ((p.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    actionKeyFunctions(scene, builder, renderer) {

        let pointerX = this.translation[0] - 2 * Math.sin(this.rotation[1]);
        let pointerY = this.translation[2] - 2 * Math.cos(this.rotation[1]);

        let found = null;
        scene.nodes.forEach(node => {
            if (pointerX <= node.translation[0] + node.scale[0] &&
                pointerX >= node.translation[0] - node.scale[0] &&
                pointerY <= node.translation[2] + node.scale[2] &&
                pointerY >= node.translation[2] - node.scale[2]) {
                found = node;
            }
        });

        let randomRotate = (Math.round(Math.random()) % (2 * Math.PI));

        if (found == null){
            scene.addNode(builder.createNode(
                {
                    "type": "seed",
                    "mesh": 1,
                    "texture": 1,
                    "aabb": {
                        "min": [-0.3, -0.1, -0.3],
                        "max": [0.3, 0.1, 0.3]
                    },
                    "translation": [pointerX, 1, pointerY],
                    "rotation": [0, randomRotate, 0],
                    "scale": [1, 1, 1]
                }
            ));
            renderer.prepare(scene);
        }
        else if (found instanceof Seed && this.hasWater) {
            let flowerPick = Math.round(Math.random()) + 2;
            scene.replaceNode(found, builder.createNode(
                {
                    "type": "flower",
                    "mesh": flowerPick,
                    "texture": flowerPick,
                    "aabb": {
                        "min": [-0.5, -0.1, -0.5],
                        "max": [0.5, 0.1, 0.5]
                    },
                    "translation": [found.translation[0], 1, found.translation[2]],
                    "rotation": [0, randomRotate, 0],
                    "scale": [0.3, 0.3, 0.3]
                }
            ));
            this.hasWater = false;
            renderer.prepare(scene);
        }
        else if (found instanceof WaterWell && !this.hasWater){
            this.hasWater = true;
        }
    }
}

Player.defaults = {
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20,
    hasWater         : false
};
