import { Node } from "../../Node.js";
import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";


/** Defines a Property of a Class of a data model. */
export class Property extends Item {
	
	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Property class. */
	static type = new NodeType('Property', 'property', Item.type,Property);

	
	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Instance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, Property.type);

		// Initialize the child nodes
		
		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}