import { NodeType } from "../../data/NodeType.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
export class Text extends Widget {
    constructor(name, parent, data) {
        super(name, parent, data, Text.type);
        this._line = new Component('text', this.component, { fill: 'url(#foreground_color)', x: 10, y: 20,
            font_family: "Arial", font_size: "20", font_weight: "bold" }, (data && data.text) ? data.text : "<Button>");
    }
}
Text.type = new NodeType('Text', 'text', Widget.type, Text);
//# sourceMappingURL=Text.js.map