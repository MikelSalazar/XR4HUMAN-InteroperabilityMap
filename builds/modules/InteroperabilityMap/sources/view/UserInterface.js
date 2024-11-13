import { KnowledgeGraph } from "../KnowledgeGraph.js";
import { Node } from "../data/Node.js";
import { NodeSet } from "../data/NodeSet.js";
import { NodeType } from "../data/NodeType.js";
import { Number } from "../data/types/simple/Number.js";
import { Color } from "../data/types/complex/Color.js";
import { Component } from "./Component.js";
import { Animation } from "./Animation.js";
import { Widget } from "./Widget.js";
export class UserInterface extends Node {
    get component() { return this._component; }
    get background() { return this._background; }
    get color() { return this._color; }
    get layers() { return this._layers; }
    get width() { return this._width; }
    get height() { return this._height; }
    constructor(name, parent, data = {}) {
        super(name, parent, data);
        this._width = new Number('width', this, 2970);
        this._height = new Number('height', this, 2100);
        this._color = new Color('color', this, 'url(#background_color)');
        this._layers = new NodeSet('layers', this, Widget.type);
        let width = this._width.value, height = this._height.value, color = this.color.toString(), unitType = 'mm';
        if (!this._component) {
            this._component = new Component('svg', undefined, {
                id: this.parent.name,
                xmlns: 'http://www.w3.org/2000/svg', version: "1.1",
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                width: (width / 10) + unitType, height: (height / 10) + unitType,
                viewBox: '0 0 ' + width + ' ' + height
            });
        }
        if (KnowledgeGraph.environment == 'browser') {
            let element = this._component.element, children = element.childNodes, childIndex = 0, childCount = children.length;
            for (childIndex = 0; childIndex < childCount; childIndex++) {
                let child = children.item(childIndex);
                if (child.nodeType != child.ELEMENT_NODE ||
                    !(child.tagName == 'defs' ||
                        child.tagName == 'script')) {
                    this._component.element.removeChild(child);
                    childIndex--;
                    childCount--;
                }
            }
            let parentElement = data.element || document.body;
            this._width.value = parentElement.clientWidth;
            this._height.value = parentElement.clientHeight;
            parentElement.append(element);
            this._component.setAttribute('style', 'position: fixed; ' +
                'top: 0; left: 0; width:100%; height:100%; user-select: none;');
        }
        new Component('linearGradient', this._component, { id: 'background_color' }, '<stop stop-color="' + '#111111' + '" stop-opacity="1"/>)');
        new Component('linearGradient', this._component, { id: 'foreground_color' }, '<stop stop-color="' + '#FFFFFF' + '" stop-opacity="1"/>)');
        this._background = new Component('rect', this._component, {
            id: "background", width: width, height: height,
            fill: "url(#background_color)"
        });
        if (data != undefined)
            this.deserialize(data);
        if (this.layers.count == 0)
            new Widget('testWidget', this.layers, { debug: true });
        if (KnowledgeGraph.environment == 'browser') {
            this.resize();
            window.addEventListener('resize', this.resize.bind(this));
            this._component.element.addEventListener('resize', this.resize.bind(this));
        }
    }
    update(forced = false) {
        if (!this._color.updated)
            this._background.setAttribute('fill', this._color.toString());
        super.update();
        if (KnowledgeGraph.environment == 'browser') {
            requestAnimationFrame(this.update.bind(this));
            return false;
        }
    }
    resize() {
        if (KnowledgeGraph.environment == 'node') {
            for (let layer of this._layers)
                if (layer.enabled)
                    layer.resize(2970, 2100);
            return;
        }
        let element = this._component.element, width = element.clientWidth, height = element.clientHeight;
        this.width.value = width;
        this.height.value = height;
        this._component.setAttribute('width', width);
        this._component.setAttribute('height', height);
        this._component.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        this._background.setAttribute('width', width);
        this._background.setAttribute('height', height);
        if (this.debug)
            console.log("Resized: " + width + ' x ' + height);
        for (let layer of this._layers)
            if (layer.enabled)
                layer.resize(width, height);
        this.update();
    }
    setStyle(styleName) {
        console.log("Changing Style To:" + styleName);
        let black = new Color('black', undefined, [0.0, 0.05, 0.1]), white = new Color('white', undefined, [1.0, 1.0, 1.0]), foregroundNode = document.getElementById('foreground_color'), backgroundNode = document.getElementById('background_color');
        let color1, color2;
        switch (styleName) {
            case "light":
                color1 = white;
                color2 = black;
                break;
            case "dark":
                color1 = black;
                color2 = white;
                break;
        }
        new Animation((t) => {
            foregroundNode.firstElementChild.setAttribute('stop-color', Color.interpolate(color1, color2, t).hex);
            backgroundNode.firstElementChild.setAttribute('stop-color', Color.interpolate(color2, color1, t).hex);
        }, undefined, 0, 1, 0, 0.2, true);
    }
}
UserInterface.type = new NodeType('UserInterface', 'ui', Node.type, UserInterface);
//# sourceMappingURL=UserInterface.js.map