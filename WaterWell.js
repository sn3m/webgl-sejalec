import Model from './Model.js';

export default class WaterWell extends Model {
}

WaterWell.defaults = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },
    ignoreCollision: false
};