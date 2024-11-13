
import { Node } from "../Node.js";
import { NodeType } from "../NodeType.js";
import { String } from "../types/simple/String.js";

/** Defines an item of a data model. */
export class Item extends Node {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the Item. */ ;

	/** The description of the Item. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the Item. */
	get title() { return this._title; }

	/** The description of the Item. */
	get description() { return this._description; }



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes an Item node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name, parent, data, type = Item.type) {

		// Call the base class constructor
		super(name, parent, undefined, Item.type);

		// Initialize the child nodes
		this._title = new String('title', this);
		this._description = new String('description', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Item class. */
Item.type = new NodeType('Item', 'item', Node.type, Item);
//# sourceMappingURL=Item.js.map