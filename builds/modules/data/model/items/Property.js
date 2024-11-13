import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";


/** Defines a Property of a Class of a data model. */
export class Property extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Instance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Property.type);

		// Initialize the child nodes

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Property class. */
Property.type = new NodeType('Property', 'property', Item.type, Property);
//# sourceMappingURL=Property.js.map