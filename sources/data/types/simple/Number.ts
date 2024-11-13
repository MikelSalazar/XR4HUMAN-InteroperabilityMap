import { Simple } from "../Simple.js";
import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";

/** Defines a simple data type that stores a numeric value. */
export class Number extends Simple<number> {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Number class. */
	static type = new NodeType('Number', 'number', Node.type, Number);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The minimum value of the Number. */
	protected _min: number;
	
	/** The maximum value of the Number. */
	protected _max: number;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The numeric value of the Number. */
	get value(): number { 
		return (this._value != undefined)? this._value: this.default; 
	}
	set value(newValue: number){ 
		if (this._value == newValue) return;
		if (this._min != undefined && newValue < this._min)	throw Error(
			'The minimum value for ' + this.id + ' is: ' + this._min);
		if (this._max != undefined && newValue > this._max) throw Error(
			'The maximum value for ' + this.id + ' is: ' + this._max);
		this._value = newValue; this.updated = false;
	}


	/** The minimum value of the Number. */
	get min(): number { return this._min; }
	set min(newMin: number) { 
		if (this._min == newMin) return;
		this._min = newMin; this.updated = false; 
	}


	/** The maximum value of the Number. */
	get max(): number { return this._max; }
	set max(newMax: number) { 
		if (this._max == newMax) return;
		this._max = newMax; this.updated = false; 
	}


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Number node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value.
	 * @param min The minimum value.
	 * @param max The maximum value. */
	constructor(name: string, parent?: Node, data?: any, 
		def?: number, min?: number, max?: number) {

		// Call the base class constructor
		super(name, parent, undefined, Number.type, def);

		// Set the default value
		if (min != undefined) this._min = min;
		if (max != undefined) this._max = max;

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The initialization data. */
	deserialize (data: any) { 
		switch (typeof data) {
			case 'boolean': this.value = (data == true)? 1 : 0; break;
			case 'number': this.value = data; break;
			case 'string': this.value = parseFloat(data); break;
			case 'object': 
				super.deserialize(data);
				if (data.min != undefined) this.min = data.min;
				if (data.max != undefined) this.max = data.max;
				if (data.default != undefined) this.default = data.default;
				if (data.value != undefined) this.value = data.value;
				break;
			default: this.value = parseFloat(data); break;
		}
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString(): string {
		if (this._value == undefined) return '(undefined)';
		let value = this.value.toString();
		if (value.includes('.')) value = this.value.toFixed(5);
	
		return value; 
	}


}
