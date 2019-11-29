export default class Scene {

    constructor() {
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
        return node;
    }

    replaceNode(del, add) {
        this.nodes.splice(this.nodes.indexOf(del), 1, add);
        return add;
    }

    traverse(before, after) {
        this.nodes.forEach(node => node.traverse(before, after));
    }

}
