import { Node } from "./Node.js";
import { NodeType } from "./NodeType.js";
export class Resource extends Node {
    get path() { return this._path; }
    set path(newPath) { this._path = newPath; this.updated = false; }
    get data() { return this._data; }
    set data(newData) { this._data = newData; this.updated = false; }
    constructor(name, parent, data) {
        super(name, parent, undefined);
        if (data != undefined)
            this.deserialize(data);
    }
    update(forced = false) {
        if (this._updated && !forced)
            return;
        return true;
    }
    deserialize(data) {
        switch (typeof data) {
            case 'string':
                this.path = data;
                break;
            case 'object':
                this.path = data.path;
                this.data = data.data;
                break;
            default: throw Error('Invalid data for: ' + this.id);
        }
    }
}
Resource.type = new NodeType('Number', 'number', Node.type, Number);
//# sourceMappingURL=Resource.js.map