import { NodeType } from "../../data/NodeType.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
export class Button extends Widget {
    ;
    get onClick() { return this._onClick; }
    set onClick(f) { this._onClick = f; }
    constructor(name, parent, data) {
        super(name, parent, data, Button.type);
        this._label = new Component('text', this.component, { fill: 'url(#foreground_color)', x: 10, y: 20,
            font_family: "Arial", font_size: "20", font_weight: "bold" }, (data && data.text) ? data.text : "<Button>");
        function clicked() {
            if (this._onClick)
                this._onClick(this);
        }
        this._label.onclick(clicked.bind(this));
    }
}
Button.type = new NodeType('Button', 'button', Widget.type, Button);
//# sourceMappingURL=Button.js.map