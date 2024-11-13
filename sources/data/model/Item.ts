
import { Node } from "../Node.js";
import { NodeType } from "../NodeType.js";
import { String } from "../types/simple/String.js";

/** Defines an item of a data model. */
export abstract class Item extends Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Item class. */
	static type = new NodeType('Item', 'item', Node.type, Item);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the Item. */;
	protected _title: String;

	/** The description of the Item. */;
	protected _description: String;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the Item. */
	get title(): String { return this._title; }

	/** The description of the Item. */
	get description(): String { return this._description; }



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes an Item node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name: string, parent?: Node, data?: any, 
		type: NodeType = Item.type) {

		// Call the base class constructor
		super(name, parent, undefined, Item.type);

		// Initialize the child nodes
		this._title = new String('title', this);
		this._description = new String('description', this);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}