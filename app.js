import Application from './Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
import Player from "./Player.js";
import SimpleAI from "./SimpleAI.js";

class App extends Application {

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;

        this.score = 10;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.load('scene.json');
    }

    async load(uri) {
        const terrain_size = 21;     //should be odd number

        const scene = await new SceneLoader().loadScene(uri);
        this.builder = new SceneBuilder(scene, terrain_size);
        this.scene = this.builder.build();
        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.player = null;
        this.simpleAI = null;
        this.scene.traverse(node => {
            if (node instanceof Player) {
                this.player = node;
            }
        });
        this.scene.traverse(node => {
            if (node instanceof SimpleAI) {
                this.simpleAI = node;
            }
        });

        this.camera = this.player.children[0];
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.player.enable();
        } else {
            this.player.disable();
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.player) {
            this.player.update(dt, this.scene, this.builder, this.renderer);
        }

        if (this.physics) {
            this.physics.update(dt);
        }

        if (this.simpleAI){
            this.simpleAI.update(this.scene, this.player);
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new dat.GUI();
    gui.add(app, 'enableCamera');
});
