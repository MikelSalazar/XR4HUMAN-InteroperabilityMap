import { NodeType } from "../../data/NodeType.js";
import { Boolean } from "../../data/types/simple/Boolean.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
import { Animation } from "../Animation.js";
export class Switch extends Widget {
    get onChange() { return this._onChange; }
    set onChange(f) { this._onChange = f; }
    constructor(name, parent, data) {
        super(name, parent, data, Switch.type);
        this._value = new Boolean('value', this, false);
        let x = 100, y = 20, w = 30, h = 20, x1 = x, x2 = x + w, r = h / 2, y1 = y - r, y2 = y + r;
        this._label = new Component('text', this.component, { fill: 'url(#foreground_color)', x: 10, y: y,
            font_family: "Arial", font_size: "20",
            font_weight: "bold", dominant_baseline: "middle" }, (data && data.text) ? data.text : "<Label>: ");
        this._background = new Component('path', this.component, {
            fill: 'url(#background_color)',
            d: 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y1 +
                ' A ' + r + ' ' + r + ' 0 1 1 ' + x2 + ' ' + y2 +
                ' L ' + x1 + ' ' + y2 +
                ' A ' + r + ' ' + r + ' 0 1 1 ' + x1 + ' ' + y1
        });
        this._knob = new Component('circle', this.component, { cx: x1, cy: (y1 + y2) / 2, r: r, fill: 'url(#foreground_color)' });
        this._knob.animations['switch'] = new Animation(this._knob, 'cx', x1, x2, 0, 0.25, false);
        function changed() {
            this._knob.animations['switch'].play(1, this._value.value);
            this._value.value = !this._value.value;
            if (this._onChange)
                this._onChange(this);
        }
        this._label.onclick(changed.bind(this));
        this._background.onclick(changed.bind(this));
        this._knob.onclick(changed.bind(this));
    }
}
Switch.type = new NodeType('Switch', 'switch', Widget.type, Switch);
//# sourceMappingURL=Switch.js.map