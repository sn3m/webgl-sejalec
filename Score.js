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
        this.allow_updates = true;              // prevents score updates after the game is over

        this.points = 1;
        this.lost_flowers = 0;
        this.penalty = 3;

        this.percentage = 0;
        this.value = 0;

        document.getElementById("game_won_text").innerHTML = '';
    }

    increase() {
        if(this.allow_updates) {
            this.num_flowers++;
            this.evaluate();
        }
    }

    decrease() {
        if(this.allow_updates) {
            this.num_flowers--;
            this.lost_flowers++;
            this.evaluate();
        }
    }

    evaluate() {
        if(this.num_tiles === 0) {
            this.percentage = 0;
            this.value = 0;
        } else {
            this.percentage = Math.min(Math.floor(this.num_flowers*100/(this.num_tiles*0.80)), 100);
            this.value = Math.max(0, this.num_flowers*this.points - this.lost_flowers*this.penalty);
        }
        this.display();
    }

    display() {
        var bar = document.getElementById("flowers");
        bar.setAttribute("value", this.percentage);

        if(this.percentage >= 100) {
            // the game has been won
            var tmp = document.getElementById("game_won_text");
            tmp.innerHTML = '<div class="endgame_overlay"><div class="box"><p>YOU WIN!!!</p><p>Your score: ' + this.value + '</p></div></div>';
        }
    }
}