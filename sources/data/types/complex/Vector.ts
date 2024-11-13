import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";
import { Complex } from "../Complex.js";
import { Number } from "../simple/Number.js";

/** Defines a generic three-dimensional vector. */
export class Vector extends Complex {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Vector class. */
	static type = new NodeType('Vector', 'vector', Complex.type, Vector);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The value of the Vector in the X axis. */;
	protected _x: Number;

	/** The value of the Vector in the Y axis. */;
	protected _y: Number;

	/** The value of the Vector in the Y axis. */;
	protected _z: Number;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the Vector in the X axis. */;
	get x(): Number { return this._x; }

	/** The value of the Vector in the Y axis. */;
	get y(): Number { return this._y; }

	/** The value of the Vector in the Z axis. */;
	get z(): Number { return this._z; }

	/** Indicates if the value is undefined. */
	get isUndefined(): boolean {
		return this._x.isUndefined && this._y.isUndefined && this._z.isUndefined;
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
		this._x = new Number('x', this, undefined, 0);
		this._y = new Number('y', this, undefined, 0);
		this._z = new Number('z', this, undefined, 0);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets the values of the Vector.
	 * @returns The values of the Vector. */
	getValues(x: number = 0, y: number = 0, z: number = 0) {
		return { x: this._x.value, y: this._y.value, z: this._z.value };
	}

	/** Sets the values of the Vector.
	 * @param x The value of the Vector in the X axis.
	 * @param y The value of the Vector in the Y axis.
	 * @param z The value of the Vector in the Z axis. */
	setValues(x: number = 0, y: number = 0, z: number = 0) {
		if (x != undefined) this._x.value = x;
		if (y != undefined) this._y.value = y;
		if (z != undefined) this._z.value = z;
	}

	/** Adds numeric values to the Vector.
	 * @param x The value to add in the X axis.
	 * @param y The value to add in the Y axis.
	 * @param z The value to add in the Z axis. */
	addValues(x: number = 0, y: number = 0, z: number = 0) {
		if (x != undefined) this._x.value += x;
		if (y != undefined) this._y.value += y;
		if (z != undefined) this._z.value += z;
	}


	/** Subtracts numeric values to the Vector.
	 * @param x The value to subtract in the X axis.
	 * @param y The value to subtract in the Y axis.
	 * @param z The value to subtract in the Z axis. */
	subtractValues(x: number = 0, y: number = 0, z: number = 0) {
		if (x != undefined) this._x.value += x;
		if (y != undefined) this._y.value += y;
		if (z != undefined) this._z.value += z;
	}


	/** Calculates the distance between two Vector instances.
	 * @param v1 The first Vector instance.
	 * @param v2 The second Vector instance.
	 * @returns Calculates the distance between the two Vector instances. */ 
	static distance(v1: Vector, v2: Vector) {
		let dx = (v1._x.value || 0)- (v2._x.value || 0),
			dy = (v1._y.value || 0)- (v2._y.value || 0),
			dz = (v1._z.value || 0)- (v2._z.value || 0);
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
}