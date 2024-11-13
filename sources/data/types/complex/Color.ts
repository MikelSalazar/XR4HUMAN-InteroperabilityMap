import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";
import { Complex } from "../Complex.js";
import { Number } from "../simple/Number.js";
import { String } from "../simple/String.js";

/** Defines an RGBA Color. */
export class Color extends Complex {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Color class. */
	static type = new NodeType('Color', 'color', Complex.type, Color);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The Red component of the Color. */;
	protected _r: Number;

	/** The Green component of the Color. */;
	protected _g: Number;

	/** The Blue component of the Color. */;
	protected _b: Number;

	/** The Alpha component of the Color. */;
	protected _a: Number;

	/** The text representation of the Color. */;
	protected _text: String;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The Red component of the Color. */;
	get r(): Number { return this._r; }

	/** The Green component of the Color. */;
	get g(): Number { return this._g; }

	/** The Blue component of the Color. */;
	get b(): Number { return this._b; }

	/** The Alpha component of the Color. */;
	get a(): Number { return this._a; }

	/** The text representation of the Color. */;
	get text(): String { return this._text; }

	/** The hexadecimal value of the Color. */
	get hex() {
		let r = Math.floor(this._r.value * 255).toString(16).padStart(2,'0'),
			g = Math.floor(this._g.value * 255).toString(16).padStart(2,'0'),
			b = Math.floor(this._b.value * 255).toString(16).padStart(2,'0'),
			a = (this._a.value == 1)? '' : 
				Math.floor(this._a.value * 255).toString(16).padStart(2,'0');
		return '#' + r + g + b + a;
	}
	set hex(v: string) {
		try {
			this._text.value = undefined;
			if (v[0] == '#') v = v.slice(1);
			let charCount = v.length, short = charCount < 5;
			if (charCount < 3) throw Error ("Wrong value") 
			let r = parseInt(short? v[0] + v[0]: v[0] + v[1], 16);
			this._r.value = (r > 0)? r / 255 : 0;
			let g = parseInt(short? v[1] + v[1]: v[2] + v[3], 16);
			this._g.value = (g > 0)? g / 255 : 0;
			let b = parseInt(short? v[2] + v[2]: v[4] + v[5], 16);
			this._b.value = (b > 0)? b / 255 : 0;
			if (!(charCount == 4 || charCount == 8)) return;
			let a  = parseInt(short? v[3] + v[3]: v[6] + v[7], 16);
			this._a.value = (a > 0)?  a / 255 : 0;
		} catch (e) { 
			throw Error ('Invalid Hex value "' + v + '" for ' + this.id);
		}
	}

	/** Indicates if the Color is undefined. */
	get isUndefined(): boolean {
		return this._r.isUndefined && this._g.isUndefined 
			&& this._b.isUndefined && this._a.isUndefined;
	}
	
	/** Indicates if the Color is default. */
	get isDefault(): boolean {
		return this._r.isDefault && this._g.isDefault 
			&& this._b.isDefault && this._a.isDefault;
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Vector node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, data);

		// Initialize the child nodes
		this._r = new Number('r', this, undefined, 0);
		this._g = new Number('g', this, undefined, 0);
		this._b = new Number('b', this, undefined, 0);
		this._a = new Number('a', this, undefined, 1);
		this._text = new String('text', this);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize (data: any) { 


		if (Array.isArray(data)) {
			if (data.length > 0) this._r.value = data[0];
			if (data.length > 1) this._g.value = data[1];
			if (data.length > 2) this._b.value = data[2];
			if (data.length > 3) this._a.value = data[3];
		} else {
			let dataType = typeof data;
			if (typeof data == 'object') {
				super.deserialize(data);
				if (data.r != undefined) this._r.value = data.r;
				if (data.g != undefined) this._g.value = data.g;
				if (data.b != undefined) this._b.value = data.b;
				if (data.a != undefined) this._a.value = data.a;
			} else if (dataType == 'number') {
				this._r.value = this._g.value = this._b.value = data;
			} else if (dataType == 'string') {
				if (data.startsWith('#')) this.hex = data;
				else this._text.value = data;
			} else throw Error ('Invalid value: "' + data.toString() + '" ' +
				'of type"' + dataType +  '" for: ' + this.id);
		}
	}


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params: any = {}): any {
		if (this.text.value) return this.text.value;
		let v = [this._r.value, this._g.value, this._b.value, this._a.value];
		if (v[0] == 0 && v[1] == 0 && v[2] == 0 && v[3] == 1) return undefined;
		if (v[3] == 1) v.pop(); return v;
	}


	/** Serializes the instance to a string representation.
	 * @returns The string representation with the data of the instance. */
	toString(): string {
		if (this.text.value) return this.text.value; else return this.hex;
	}


	/** Interpolates between two Color Instances.
	 * @param c1 The first Color instance. 
	 * @param c2 The second Color instance.
	 * @param t The interpolation value (between 0 and 1)
	 * @returns The interpolated Color instance. */
	static interpolate(c1: Color, c2: Color, t: number): Color {
		return new Color('color', undefined, [
			c1._r.value + (c2._r.value - c1._r.value) * t,
			c1._g.value + (c2._g.value - c1._g.value) * t,
			c1._b.value + (c2._b.value - c1._b.value) * t,
		]);
	}
}