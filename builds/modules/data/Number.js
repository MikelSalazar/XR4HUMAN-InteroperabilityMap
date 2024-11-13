import { Simple } from "../Simple.js";
import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";
export class Number extends Simple {
    get value() {
        return (this._value != undefined) ? this._value : this.default;
    }
    set value(newValue) {
        if (this._value == newValue)
            return;
        if (this._min != undefined && newValue < this._min)
            throw Error('The minimum value for ' + this.id + ' is: ' + this._min);
        if (this._max != undefined && newValue > this._max)
            throw Error('The maximum value for ' + this.id + ' is: ' + this._max);
        this._value = newValue;
        this.updated = false;
    }
    get min() { return this._min; }
    set min(newMin) {
        if (this._min == newMin)
            return;
        this._min = newMin;
        this.updated = false;
    }
    get max() { return this._max; }
    set max(newMax) {
        if (this._max == newMax)
            return;
        this._max = newMax;
        this.updated = false;
    }
    constructor(name, parent, data, def, min, max) {
        super(name, parent, undefined, Number.type, def);
        if (min != undefined)
            this._min = min;
        if (max != undefined)
            this._max = max;
        if (data != undefined)
            this.deserialize(data);
    }
    deserialize(data) {
        switch (typeof data) {
            case 'boolean':
                this.value = (data == true) ? 1 : 0;
                break;
            case 'number':
                this.value = data;
                break;
            case 'string':
                this.value = parseFloat(data);
                break;
            case 'object':
                super.deserialize(data);
                if (data.min != undefined)
                    this.min = data.min;
                if (data.max != undefined)
                    this.max = data.max;
                if (data.default != undefined)
                    this.default = data.default;
                if (data.value != undefined)
                    this.value = data.value;
                break;
            default:
                this.value = parseFloat(data);
                break;
        }
    }
    toString() {
        if (this._value == undefined)
            return '(undefined)';
        let value = this.value.toString();
        if (value.includes('.'))
            value = this.value.toFixed(5);
        return value;
    }
}
Number.type = new NodeType('Number', 'number', Node.type, Number);
//# sourceMappingURL=Number.js.map