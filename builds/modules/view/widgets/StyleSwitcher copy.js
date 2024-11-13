import { NodeType } from "../../data/NodeType.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
import { Animation } from "../Animation.js";
import { UserInterface } from "../UserInterface.js";
export class ViewResetter extends Widget {
    constructor(name, parent, data) {
        super(name, parent, data, ViewResetter.type);
        this.width.value = 80;
        this.height.value = 100;
        this._backgroundColor.hex = '#00000000';
        let cx = 40, cy = 40, ir = 20, or = 30;
        let circle = new Component('circle', this.component, { cx: 40, cy: 40, r: 20, fill: 'url(#foreground_color)' });
        for (let angle = 0; angle < 360; angle += 45) {
            let a = angle * Math.PI / 180, s = Math.sin(a), c = Math.cos(a);
            new Component('line', this.component, {
                x1: cx, x2: cy + c * or, y1: cx, y2: cy + s * or,
                stroke: 'url(#foreground_color)', stroke_width: 5
            });
        }
        new Component('text', this.component, { x: 40, y: 100, text_anchor: 'middle', font_family: 'Arial',
            font_size: 14, fill: 'url(#foreground_color)' }, 'Switch Style');
        circle.animations['switch'] = new Animation(circle, 'r', ir, or, 0, 0.25, false);
        function changed() {
            circle.animations['switch'].play(1, this._value.value);
            this._value.value = !this._value.value;
            if (this._onChange)
                this._onChange(this);
            this.ancestor(UserInterface).setStyle(this._value.value ? 'light' : 'dark');
        }
        this._component.onclick = changed.bind(this);
    }
}
ViewResetter.type = new NodeType('ViewResetter', 'view-resetter', Widget.type, ViewResetter);
//# sourceMappingURL=StyleSwitcher%20copy.js.map