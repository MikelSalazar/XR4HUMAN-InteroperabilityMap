import { Node } from "../data/Node.js";
import { NodeSet } from "../data/NodeSet.js";
import { NodeType } from "../data/NodeType.js";
import { Number } from "../data/types/simple/Number.js";
import { String } from "../data/types/simple/String.js";
import { Vector } from "../data/types/complex/Vector.js";
import { Component } from "./Component.js";
import { UserInterface } from "./UserInterface.js";
export class Widget extends Node {
    get component() { return this._component; }
    get enabled() { return this._enabled; }
    set enabled(e) { this._enabled = e; }
    get width() { return this._width; }
    get height() { return this._height; }
    get anchor() { return this._anchor; }
    get position() { return this._position; }
    get widgets() { return this._widgets; }
    constructor(name, parent, data, type = Widget.type) {
        super(name, parent, data, type);
        this._width = new Number('width', this, undefined, 0);
        this._height = new Number('height', this, undefined, 0);
        this._anchor = new String('anchor', this, { validValues: Widget.anchorValues });
        this._position = new Vector('position', this);
        this._scale = new Number('scale', this, undefined, 1, 0.1, 10);
        this._widgets = new NodeSet('widgets', this, Widget.type);
        let node = this.parent;
        while (node) {
            let component = node.component;
            if (component) {
                this._parentComponent = component;
                break;
            }
            node = node.parent;
        }
        if (!this._parentComponent)
            throw Error('No parent component for: ' + this.id);
        this._component = new Component('g', this._parentComponent, { id: this.name });
        this._enabled = true;
        this._dragEvents = false;
        this._component.width = this._width.value;
        this._component.height = this._height.value;
        if (data != undefined)
            this.deserialize(data);
    }
    update(forced = false) {
        if (this._updated && !forced)
            return;
        let position = this.position.getValues(), scale = this._scale.value, x = position.x, y = position.y, w = this._width.value || 0, h = this._height.value || 0, p = this._parentComponent, pw = p.width, ph = p.height;
        switch (this._anchor.value) {
            case 'top':
                x += (pw - w) / 2;
                break;
            case 'top-right':
                x += pw - w;
                break;
            case 'left':
                x += pw - w;
                y += (ph - h) / 2;
                break;
            case 'center':
                x += (pw - w) / 2;
                y += (ph - h) / 2;
                break;
            case 'right':
                x += pw - w;
                y += (ph - h) / 2;
                break;
            case 'bottom-left':
                x += 0;
                y += ph - h;
                break;
            case 'bottom':
                x += (pw - w) / 2;
                y += ph - h;
                break;
            case 'bottom-right':
                x += pw - w;
                y += ph - h;
                break;
            case 'movable':
                this.enableEvents();
                x += (pw - w) / 2;
                y += (ph - h) / 2;
                break;
        }
        this._component.setAttribute('transform', (scale != 1 ? 'scale(' + Component.serializeNumber(scale) + ') ' : '') +
            'translate(' + x + ' ' + y + ')');
        return super.update();
    }
    resize(width, height) {
        this._component.width = width;
        this._component.height = height;
        this._width.value = width;
        this._height.value = height;
        this._updated = false;
        this.update(true);
        if (this.debug)
            console.log("Resized " + this._type.name +
                ' "' + this.id + '": ' + width + ' x ' + height);
    }
    enableEvents() {
        let ui = this.ancestor(UserInterface);
        let element = ui.component.element;
        element.addEventListener('mousedown', (e) => {
            this.react('down', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            this.react('move', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
            e.preventDefault();
        });
        element.addEventListener('mouseup', (e) => {
            this.react('up', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
            e.preventDefault();
        });
        element.addEventListener('wheel', (e) => {
            this.react('zoom', e.buttons, e.pageX - element.clientLeft, e.pageY - element.clientTop, e.movementX, e.movementY, e.deltaY < 0 ? 0.1 : -0.1);
        });
        let cursorX = 0, cursorY = 0, maxTouches = 0;
        element.addEventListener('touchstart', (e) => {
            let touch = e.touches[0], touchCount = e.touches.length;
            cursorX = touch.clientX;
            cursorY = touch.clientY;
            this.react('down', touchCount, cursorX, cursorY);
            maxTouches = touchCount;
        });
        element.addEventListener('touchend', (e) => {
            let touch = e.touches[0], touchCount = e.touches.length, mx = touch.clientX - cursorX, my = touch.clientY - cursorY;
            cursorX = touch.clientX;
            cursorY = touch.clientY;
            this.react('up', touchCount, cursorX, cursorY, mx, my);
        });
        let touchSeparation = undefined;
        element.addEventListener('touchmove', (e) => {
            if (e.touches.length < 2) {
                let touch = e.touches[0], touchCount = e.touches.length, mx = touch.clientX - cursorX, my = touch.clientY - cursorY;
                cursorX = touch.clientX;
                cursorY = touch.clientY;
                this.react('move', touchCount, cursorX, cursorY, mx, my);
                e.preventDefault();
            }
            else {
                let dx = e.touches[1].pageX - e.touches[0].pageX, dy = e.touches[1].pageY - e.touches[0].pageY, s = Math.sqrt(dx * dx + dy * dy) / 100, x = e.touches[1].pageX - element.clientLeft - dx / 2, y = e.touches[1].pageY - element.clientTop - dy / 2;
                if (touchSeparation != undefined)
                    this.react('zoom', 0, x, y, 0, 0, s - touchSeparation);
                touchSeparation = s;
            }
        });
        element.addEventListener('touchend', (e) => {
            touchSeparation = undefined;
        });
    }
    react(action, button, x, y, mx, my, mz) {
        if (!this._enabled)
            return;
        if (action == 'move') {
            if (button > 0)
                this._position.addValues(mx, my);
            return;
        }
        if (action == 'zoom') {
            let oldZoom = this._scale.value, newZoom = this._scale.value + mz;
            if (newZoom < this._scale.min)
                newZoom = this._scale.min;
            else if (newZoom > this._scale.max)
                newZoom = this._scale.max;
            this._scale.value = newZoom;
            let relX = -(this._position.x.value + this._width.value / 2), relY = -(this._position.y.value + this._height.value / 2);
            let oldX = (x + relX) * oldZoom, oldY = (y + relY) * oldZoom, newX = (x + relX) * newZoom, newY = (y + relY) * newZoom;
            this._position.x.value += (oldX - newX) / newZoom;
            this._position.y.value += (oldY - newY) / newZoom;
        }
    }
}
Widget.type = new NodeType('Widget', 'widget', Node.type, Widget);
Widget.anchorValues = ['top-left', 'top', 'top-right', 'left', 'center',
    'right', 'bottom-left', 'bottom-center', 'bottom-right', 'movable'];
//# sourceMappingURL=Widget.js.map