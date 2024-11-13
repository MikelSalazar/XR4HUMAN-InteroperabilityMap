import { Simple } from "../Simple.js";
import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";


/** Defines a simple data type that stores a textual value. */
export class String extends Simple<string> {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the String class. */
	static type = new NodeType('String', 'string', Node.type, String);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The valid values of the String. */
	protected _options: string[];
	

	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the String data type. */
	get value(): string {
		return (this._value != undefined)? this._value: this.default; 
	}
	set value(newValue: string) {
		if (this._value == newValue) return;
		if (this._options.length > 0 && !this._options.includes(newValue))
			throw('Invalid value: "' + newValue + '" ' +
			' valid value are: "' + this._options.join('", ,"') + '"');
		this._value = newValue; this.updated = false;
	}

	/** The valid values of the String. */
	get options(): string[] { return this._options; }
	set options(newOptions: string[]) { 
		if (!Array.isArray(newOptions)) return;
		this._options = [];
		for (let newValidValue of newOptions)
			this._options.push(newValidValue);
	}


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the String node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value. */
	constructor(name: string, parent?: Node, data?: any, def?: string) {

		// Call the base class constructor
		super(name, parent, undefined, String.type, def);

		// Initialize the lis of valid values
		this._options = [];

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data: any) { 
		switch (typeof data) {
			case 'boolean': this.value = (data==true)?'true':'false'; break;
			case 'number': this.value = data.toString(); break;
			case 'string': this.value = data; break;
			case 'object': 
				if (data.validValues != undefined) 
					this.options = data.validValues;
				if (data.default != undefined) this.default = data.default;
				if (data.value != undefined) this.value = data.value;
				break;
			default: this.value = data.toString(); break;
		}
	}
}