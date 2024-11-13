import { Simple } from "../Simple.js";
import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";


/** Defines a simple data type that stores a boolean value. */
export class Boolean extends Simple {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Boolean node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value. */
	constructor(name, parent, data, def) {

		// Call the base class constructor
		super(name, parent, undefined, Boolean.type, def);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'boolean':
				this.value = (data == true);
				break;
			case 'number':
				this.value = data != 0;
				break;
			case 'string':
				this.value = (data.toLowerCase() == 'true');
				break;
			case 'object':
				super.deserialize(data);
				if (data.default != undefined)
					this.default = data.default;
				if (data.value != undefined)
					this.value = data.value;
				break;
			default:
				this.value = (data != 0);
				break;
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Boolean class. */
Boolean.type = new NodeType('Boolean', 'boolean', Node.type, Boolean);
//# sourceMappingURL=Boolean.js.map