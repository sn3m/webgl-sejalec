import Node from "./Node.js";
import Utils from "./Utils.js";
import Seed from "./Seed.js";
import Flower from "./Flower.js";

export default class SimpleAI extends Node {

    constructor(mesh, image, options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        this.mesh = mesh;
        this.image = image;
        this.enableEmergeAfter(20000);
    }

    enableEmergeAfter(number){
        let ai = this;
        setTimeout(function () {
           ai.startEmerging = true;
        }, number);
    }

    update(scene, player){
        let ai = this;

        if (Math.abs(player.translation[0] - ai.translation[0]) < 3  &&
            Math.abs(player.translation[1] - ai.translation[1]) < 10  &&
            Math.abs(player.translation[2] - ai.translation[2]) < 3){
            ai.vanish(scene, player);
        }

        if (ai.startEmerging){
            ai.startEmerging = false;
            ai.emerge(scene, player);
        }
    }

    emerge(scene, player){
        let ai = this;
        let chosenSeedFlower = this.chooseRandomSeedFlower(scene);

        if (chosenSeedFlower){
            this.invisible = false;
            this.translation[0] = chosenSeedFlower.translation[0];
            this.translation[1] = chosenSeedFlower.translation[1] + 5;
            this.translation[2] = chosenSeedFlower.translation[2];
            this.updateTransform(chosenSeedFlower);

            this.startConquering(chosenSeedFlower, scene, player);
        } else {
            setTimeout(function () {
               ai.emerge(scene, player);
            }, 5000);
        }
    }

    vanish(scene, player){
        let ai = this;
        this.invisible = true;
        this.translation[0] = 0;
        this.translation[1] = -30;
        this.translation[2] = 0;
        this.updateTransform();
        setTimeout(function () {
            ai.emerge(scene, player);
        }, 30000);
    }

    chooseRandomSeedFlower(scene){
        let seedsAndFlowers = [];
        scene.nodes.forEach(node => {
            if ((node instanceof Seed) || (node instanceof Flower)){
                seedsAndFlowers.push(node);
            }
        });

        if (seedsAndFlowers.length > 0){
            return seedsAndFlowers[Math.floor(Math.random()*seedsAndFlowers.length)];
        }
        else {
            return null;
        }

    }

    startConquering(node, scene, player) {
        let ai = this;
        setTimeout(function () {
            if (!ai.invisible) {
                scene.deleteNode(node);
                player.score.decrease();
                ai.vanish(scene, player);
            }
        }, 5000);
    }
}

SimpleAI.defaults = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [3, 3, 3],
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },
    ignoreCollision: true,
    invisible: true
};