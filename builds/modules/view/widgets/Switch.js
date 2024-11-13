import { NodeType } from "../../data/NodeType.js";
import { Boolean } from "../../data/types/simple/Boolean.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
import { UserInterface } from "../UserInterface.js";
export class StyleSwitcher extends Widget {
    constructor(name, parent, data) {
        super(name, parent, data, StyleSwitcher.type);
        this._value = new Boolean('value', this, false);
        let x = 100, y = 20, w = 30, h = 20, x1 = x, x2 = x + w, r = h / 2, y1 = y - r, y2 = y + r;
        this._button = new Component('circle', this.component, { cx: x1, cy: (y1 + y2) / 2, r: r, fill: 'url(#foreground_color)' });
        function changed() {
            this._value.value = !this._value.value;
            if (this._onChange)
                this._onChange(this);
            this.ancestor(UserInterface).setStyle(this._value.value ? 'light' : 'dark');
        }
        this._component.onclick = changed.bind(this);
    }
}
StyleSwitcher.type = new NodeType('Switch', 'switch', Widget.type, StyleSwitcher);
//# sourceMappingURL=Switch.js.map