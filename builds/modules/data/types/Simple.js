import { Node } from "../Node.js";
import { NodeType } from "../NodeType.js";


/** Defines a Simple data type. */
export class Simple extends Node {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The value of the Simple data type. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the Simple data type. */ ;
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (this._value == newValue)
			return;
		this._value = newValue;
		this.updated = false;
	}


	/** The default value of the Simple data type. */
	get default() { return this._default; }
	set default(newDefault) {
		if (this._default == newDefault)
			return;
		this._default = newDefault;
		this.updated = false;
	}

	/** Indicates if the value is undefined. */
	get isUndefined() { return this._value == undefined; }


	/** Indicates if the value is the default. */
	get isDefault() {
		return this.default != undefined && this._value == this._default;
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Simple instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node.
	 * @param def The default value of the Simple data type. */
	constructor(name, parent, data, type = Node.type, def) {

		// Call the base class constructor
		super(name, parent, data, type);

		// Save the default value
		this._default = def;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data) { this.value = data; }


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) { return this.value; }


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() {
		return (this.value != undefined) ? this.value.toString() : '(undefined)';
	}


	/** Obtains the value of the instance.
	 * @returns The value of the instance. */
	valueOf() { return this.value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Simple class. */
Simple.type = new NodeType('Simple', 'simple', null, Simple);
//# sourceMappingURL=Simple.js.map