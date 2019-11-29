import Utils from './Utils.js';
import Node from './Node.js';
import Seed from "./Seed.js";
import WaterWell from "./WaterWell.js";
import TerrainCell from "./TerrainCell.js";
import Skybox from "./Skybox.js";
import Score from "./Score.js";
import TreeOfLife from "./TreeOfLife.js";

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Player extends Node {

    constructor(mesh, image, options, size) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.mesh = mesh;
        this.image = image;

        this.enableKeySpace = true;
        this.enableKeyJ = true;
        this.enableKeyK = true;
        this.enableKeyL = true;

        this.score = new Score(size, size);
        this.score.display();

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

        // 5: put seed in front of player
        if (this.keys['KeyJ'] && this.enableKeyJ) {
            c.enableKeyJ = false;
            c.actionKeyJ(scene, builder, renderer);
            setTimeout(function(){
                c.enableKeyJ = true;
            }, 1000);
        }

        // 6: pick up water
        if (this.keys['KeyK'] && this.enableKeyK){
            c.enableKeyK = false;
            c.actionKeyK(scene);
            setTimeout(function(){
                c.enableKeyK = true;
            }, 1000);
        }

        // 7: water the seed
        if (this.keys['KeyL'] && this.enableKeyL){
            c.enableKeyL = false;
            c.actionKeyL(scene, builder, renderer);
            setTimeout(function(){
                c.enableKeyL = true;
            }, 1000);
        }

        // // jumping for testing
        // if (this.keys['Space'] && this.enableKeySpace){
        //     c.enableKeySpace = false;
        //     c.actionKeySpace();
        //     setTimeout(function(){
        //         c.enableKeySpace = true;
        //     }, 1000);
        // }

        // game over :)
        if (!this.score.allow_updates){
            let found = null;
            scene.traverse(node => {
                if (node instanceof TreeOfLife) {
                    found = node;
                }
            });
            let addedNode = scene.replaceNode(found, builder.createNode(
                {
                    "type": "treeoflife",
                    "mesh": 3,
                    "texture": 3,
                    "aabb": {
                        "min": [-2.5, -2.5, -2.5],
                        "max": [2.5, 100, 2.5]
                    },
                    "translation": [0, -5, 0],
                    "scale": [5, 5, 5]
                }
            ));
            renderer.renderSingleNode(addedNode);
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

    actionKeyJ(scene, builder, renderer) {
        // is something in front of player
        // if not add Seed node in front
        const found = this.getNodeInFront(scene);
        const terrainCell = this.getTerrainCellInFront(scene);

        if (found == null && terrainCell != null){
            const randomRotate = (Math.round(Math.random()) % (2 * Math.PI));
            const pointerX = this.translation[0] - 2 * Math.sin(this.rotation[1]);
            const pointerY = this.translation[2] - 2 * Math.cos(this.rotation[1]);
            let addedNode = scene.addNode(builder.createNode(
                {
                    "type": "seed",
                    "mesh": 1,
                    "texture": 0,
                    "aabb": {
                        "min": [-0.3, -0.1, -0.3],
                        "max": [0.3, 0.1, 0.3]
                    },
                    "translation": [pointerX,  terrainCell.translation[1] + terrainCell.scale[1] + 0.5, pointerY],
                    "rotation": [0, randomRotate, 0],
                    "scale": [1, 1, 1]
                }
            ));
            renderer.renderSingleNode(addedNode);
        }
    }

    actionKeyK(scene){
        // is something in front of player
        // if WaterWell get water
        const found = this.getNodeInFront(scene);

        if (found instanceof WaterWell){
            if (this.waterInLiters + 3 > 10) this.waterInLiters = 10;
            else this.waterInLiters += 3;
            document.getElementById("water").setAttribute("value", this.waterInLiters);
        }
    }

    actionKeyL(scene, builder, renderer) {
        // is something in front of player
        // if Seed and player has water
        // water the seed

        if (this.waterInLiters === 0) {
            alert("Vode nimajo!");
            return;
        }

        const found = this.getNodeInFront(scene);
        const terrainCell = this.getTerrainCellInFront(scene);

        if (found instanceof Seed && terrainCell != null && this.waterInLiters > 0) {
            const randomRotate = (Math.round(Math.random()) % (2 * Math.PI));
            const flowerPick = Math.round(Math.random()) + 2;
            let addedNode = scene.replaceNode(found, builder.createNode(
                {
                    "type": "flower",
                    "mesh": flowerPick,
                    "texture": flowerPick,
                    "aabb": {
                        "min": [-0.5, -0.1, -0.5],
                        "max": [0.5, 0.1, 0.5]
                    },
                    "translation": [found.translation[0], terrainCell.translation[1] + terrainCell.scale[1], found.translation[2]],
                    "rotation": [0, randomRotate, 0],
                    "scale": [0.3, 0.3, 0.3]
                }
            ));
            this.waterInLiters--;
            this.score.increase();
            document.getElementById("water").setAttribute("value", this.waterInLiters);
            renderer.renderSingleNode(addedNode);
        }
    }

    // actionKeySpace() {
    //     // jump, very simple but not looking smooth at all :)
    //     this.translation[1] += 3;
    // }

    getNodeInFront(scene) {
        const pointerX = this.translation[0] - 2 * Math.sin(this.rotation[1]);
        const pointerY = this.translation[2] - 2 * Math.cos(this.rotation[1]);
        let found = null;
        scene.nodes.forEach(node => {
            if (!(node instanceof TerrainCell) && !(node instanceof Skybox)){
                if (pointerX <= node.translation[0] + node.scale[0] &&
                    pointerX >= node.translation[0] - node.scale[0] &&
                    pointerY <= node.translation[2] + node.scale[2] &&
                    pointerY >= node.translation[2] - node.scale[2]) {
                    found = node;
                }
            }
        });
        return found;
    }

    getTerrainCellInFront(scene) {
        const pointerX = this.translation[0] - 2 * Math.sin(this.rotation[1]);
        const pointerY = this.translation[2] - 2 * Math.cos(this.rotation[1]);
        let found = null;
        scene.nodes.forEach(node => {
            if (node instanceof TerrainCell){
                if (pointerX <= node.translation[0] + node.scale[0] &&
                    pointerX >= node.translation[0] - node.scale[0] &&
                    pointerY <= node.translation[2] + node.scale[2] &&
                    pointerY >= node.translation[2] - node.scale[2]) {
                    found = node;
                }
            }
        });
        return found;
    }
}

Player.defaults = {
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 7,
    friction         : 0.2,
    acceleration     : 20,
    waterInLiters    : 3,
    score            : null
};