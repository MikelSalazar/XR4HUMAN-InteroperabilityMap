import { KnowledgeGraph } from "../KnowledgeGraph.js";
export class Component {
    get tag() { return this._tag; }
    get width() { return this._width; }
    set width(w) { this._width = w; }
    get height() { return this._height; }
    set height(h) { this._height = h; }
    get content() { return this._content; }
    set content(c) {
        this._content = c;
        if (this._element)
            this._element.innerHTML = c;
    }
    get enabled() { return this._enabled; }
    set enabled(e) {
        this._element.setAttribute('visibility', e ? 'visible' : 'hidden');
        this._enabled = e;
    }
    get element() { return this._element; }
    get parent() { return this._parent; }
    get children() { return this._children; }
    get animations() { return this._animations; }
    get onclick() { return this._onclick; }
    set onclick(listener) {
        if (KnowledgeGraph.environment != 'browser')
            return;
        this._onclick = listener;
        this._element.addEventListener('click', listener);
    }
    constructor(tag, parent, attributes, content, onclick) {
        if (tag)
            this._tag = tag;
        else
            throw Error('Invalid SVG tag');
        if (KnowledgeGraph.environment == 'browser') {
            this._element = document.createElementNS('http://www.w3.org/2000/svg', tag);
            if (parent)
                parent._element.appendChild(this._element);
        }
        this._attributes = {};
        let a = attributes;
        if (attributes != undefined && typeof attributes == 'object') {
            for (let key in attributes)
                this.setAttribute(key, attributes[key]);
        }
        this._animations = {};
        if (content)
            this.content = content;
        else
            this._content = '';
        if (onclick)
            this.onclick = onclick;
        this._parent = parent;
        this._children = [];
        if (parent != undefined)
            parent._children.push(this);
    }
    getAttribute(name) { return this._attributes[name]; }
    setAttribute(name, value) {
        if (typeof value == 'number')
            value = Component.serializeNumber(value);
        if (name.indexOf('_') >= 0)
            name = name.replace(/_/g, '-');
        this._attributes[name] = value;
        if (this._element)
            this._element.setAttribute(name, value);
    }
    bringToFront() {
        if (this._element && this._element.parentNode) {
            if (!this._element.nextElementSibling)
                return;
            let parentElement = this._element.parentNode;
            parentElement.removeChild(this._element);
            parentElement.appendChild(this._element);
        }
    }
    clear() {
        for (let child of this._children)
            child._element.remove();
        this._children = [];
    }
    static serializeNumber(value) {
        let string = value.toFixed(5), point = string.indexOf('.'), cursor = point + 1, l = string.length;
        while (cursor > 0 && cursor < l - 1) {
            if (string[cursor] == '0' && string[cursor + 1] == '0') {
                if (cursor == point + 1)
                    cursor = point;
                string = string.slice(0, cursor);
                break;
            }
            cursor++;
        }
        return string;
    }
    toString(tabLevel = 0) {
        let result = '\t'.repeat(tabLevel) + '<' + this.tag;
        for (let key in this._attributes)
            result += ' ' + key + '="' + this._attributes[key] + '"';
        if (this._content)
            return result + '>' + this._content + '</' + this.tag + '>';
        if (this._children.length == 0)
            return result + '/>';
        result += '>';
        for (let child of this._children)
            result += '\n' + child.toString(tabLevel + 1);
        return result + '\n' + '\t'.repeat(tabLevel) + '</' + this.tag + '>';
    }
}
//# sourceMappingURL=Component.js.map