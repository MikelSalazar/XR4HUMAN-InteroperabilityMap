import { NodeType } from "../../data/NodeType.js";
import { String } from "../../data/types/simple/String.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
export class Graphic extends Widget {
    get resource() { return this._resource; }
    constructor(name, parent, data) {
        super(name, parent, undefined, Graphic.type);
        this._resource = new String('resource', this);
        this._useComponent = new Component('use', this._component);
        if (data != undefined)
            this.deserialize(data);
    }
    update(forced = false) {
        if (this._updated && !forced)
            return;
        if (!this._resource.updated) {
            let r = this._resource.value;
            this._useComponent.setAttribute('href', '#' + r);
            this._useComponent.setAttribute('xlink:href', '#' + r);
        }
        return super.update();
    }
}
Graphic.type = new NodeType('Graphic', 'graphic', Widget.type, Graphic);
//# sourceMappingURL=Image.js.map