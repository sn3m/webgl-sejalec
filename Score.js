import Utils from './Utils.js';
import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Score {

    constructor(tiles_x, tiles_y) {
        this.num_tiles = tiles_x*tiles_y;
    }
}

Score.defaults = {
    num_tiles        : 0,
    num_flowers      : 0,
    points           : 100,
    lost_flowers     : 0,
    penalty          : 300,
    value            : 0
};
