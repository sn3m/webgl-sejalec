import Mesh from './Mesh.js';

import Node from './Node.js';
import Model from './Model.js';
import Camera from './Camera.js';
import Player from './Player.js';
import TerrainCell from './TerrainCell.js';

import Scene from './Scene.js';
import Flower from "./Flower.js";
import Seed from "./Seed.js";
import WaterWell from "./WaterWell.js";
import TreeOfLife from "./TreeOfLife.js";
import Skybox from "./Skybox.js";
import SimpleAI from "./SimpleAI.js";

export default class SceneBuilder {

    constructor(spec, terrain_size) {
        this.spec = spec;
        this.terrain_size = terrain_size;
    }

    createNode(spec) {
        switch (spec.type) {
            //case 'camera': return new Camera(spec);
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Model(mesh, texture, spec);
            }
            case 'skybox': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Skybox(mesh, texture, spec);
            }
            case 'terrainCell' : {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new TerrainCell(mesh, texture, spec);
            }
            case 'seed': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Seed(mesh, texture, spec);
            }
            case 'flower': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Flower(mesh, texture, spec);
            }
            case 'waterwell': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new WaterWell(mesh, texture, spec);
            }
            case 'treeoflife': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new TreeOfLife(mesh, texture, spec);
            }
            case 'simpleai': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new SimpleAI(mesh, texture, spec);
            }
            case 'player' : {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                let player = new Player(mesh, texture, spec, this.terrain_size);
                player.addChild(new Camera(spec.children[0]));
                return player;
            }
            default: return new Node(spec);
        }
    }

    build() {
        let scene = new Scene();

        this.addTerrainNodes(this.terrain_size); //should be odd number

        this.spec.nodes.forEach(spec => scene.addNode(this.createNode(spec)));

        return scene;
    }

    addTerrainNodes(size) {
        const mesh = new Mesh(this.spec.meshes[2]);
        const texture = this.spec.textures[1];
        const center = (size/2);

        for(let i=0; i<size; i++) {
            for(let j=0; j<size; j++) {

                const fromCenterI = Math.abs(center-i);
                const fromCenterJ = Math.abs(center-j);
                let heightReduxHeight = 0;
                let max = 0;

                if(fromCenterI > fromCenterJ) {
                    max = fromCenterI;
                } else {
                    max = fromCenterJ;
                }

                heightReduxHeight = max * (Math.random()*0.1) + max*0.4;

                heightReduxHeight = heightReduxHeight.toFixed(2);

                this.spec.nodes.push(
                    {
                        "type": "terrainCell",
                        "mesh": 0,
                        "texture": 1,
                        "aabb": {
                            "min": [-1, 0, -1],
                            "max": [1, 1, 1]
                        },
                        "translation": [(i-center)*2, -1-heightReduxHeight, (j-center)*2]
                    }
                );
            }
        }
    }

}
