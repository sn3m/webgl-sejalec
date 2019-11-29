import Utils from './Utils.js';
import Node from './Node.js';
import Mesh from './Mesh.js';

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;

export default class TerrainCell extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }
}