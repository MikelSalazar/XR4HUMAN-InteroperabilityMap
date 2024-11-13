import { Node } from "../Node.js";
import { NodeType } from "../NodeType.js";


/** Defines a Complex data type. */
export class Complex extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Complex instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node.
	 * @param def The default values of the Complex data type. */
	constructor(name, parent, data, type = Node.type, def) {

		// Call the base class constructor
		super(name, parent, data, type);
	}

	// --------------------------------------------------------- PUBLIC METHODS


	/** Deserializes JSON data into the Complex instance.
	 * @param data The deserialization data. */
	deserialize(data) {
		let items = this.children, itemCount = items.length;
		if (Array.isArray(data)) {
			for (let valueIndex = 0; valueIndex < data.length; valueIndex++) {
				if (valueIndex > itemCount)
					break;
				items[valueIndex].deserialize(data[valueIndex]);
			}
		}
		else if (typeof data == 'object') {
			super.deserialize(data);
			for (let key in data) {
				if (!this._children[key])
					console.warn('Unknown child: "' + key + '" for: ' + this.id);
				this._children[key].deserialize(data[key]);
			}
		}
		else if (typeof data == 'number') {
			for (let item of items)
				item.deserialize(data);
		}
		else
			throw Error('Invalid values: "' + data + '" for:' + this.id);
	}


	/** Serializes the Complex instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {
		let result = [], items = this.children;
		for (let item of items) {
			if (item.isUndefined)
				break;
			result.push(item.value);
		}
		return result;
	}

	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() {
		let valueStrings = [];
		for (let item of this) {
			let itemString = item.toString();
			if (itemString == '(undefined)')
				break;
			valueStrings.push(item.toString());
		}
		return '[' + valueStrings.join(', ') + ']';
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Complex class. */
Complex.type = new NodeType('Complex', 'complex', null, Complex);
//# sourceMappingURL=Complex.js.map