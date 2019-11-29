import Utils from './Utils.js';
import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Score {

    constructor(tiles_x, tiles_y) {
        this.init(tiles_x, tiles_y);
    }

    init(tiles_x, tiles_y) {
        this.num_tiles = tiles_x*tiles_y;       // number of all tiles
        this.num_flowers = 0;                   // number of all flowers
        this.num_tiles_planted = 0;             // number of tiles with flowers on them

        this.points = 1;
        this.lost_flowers = 0;
        this.penalty = 3;

        this.percentage = 0;
        this.value = 0;
    }

    evaluate() {
        if(this.num_tiles === 0) {
            this.percentage = 0;
            this.value = 0;
        } else {
            this.percentage = Math.min(Math.floor(this.num_flowers*100/(this.num_tiles*0.80)), 100);
            this.value = Math.max(0, this.num_flowers*this.points - this.lost_flowers*this.penalty);
        }
    }

    increase() {
        this.num_flowers++;
        this.evaluate();
    }

    decrease() {
        this.num_flowers--;
        this.lost_flowers++;
        this.evaluate();
    }
}