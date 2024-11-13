import { NodeType } from "../data/NodeType.js";
import { Component } from "./Component.js";
import { Widget } from "./Widget.js";
import { UserInterface } from "./UserInterface.js";
export class Layer extends Widget {
    constructor(name, parent, data) {
        super(name, parent, data, Layer.type);
        let ui = this.ancestor(UserInterface);
        if (this._width.isUndefined)
            this._width.value = ui.width.value;
        if (this._height.isUndefined)
            this._height.value = ui.height.value;
        if (this.debug) {
            let grid = new Component('g', this._component, { id: 'grid' }), size = 500, step = 100;
            for (let i = -size; i <= size; i += step) {
                new Component('line', grid, { x1: -size, x2: size,
                    y1: i, y2: i, stroke: i == 0 ? 'red' : 'grey' });
                new Component('line', grid, { y1: -size, y2: size,
                    x1: i, x2: i, stroke: i == 0 ? 'green' : 'grey' });
            }
        }
    }
}
Layer.type = new NodeType('Layer', 'layer', Widget.type, Layer);
//# sourceMappingURL=Layer.js.map