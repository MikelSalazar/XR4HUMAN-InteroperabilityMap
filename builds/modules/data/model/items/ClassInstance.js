import { NodeSet } from "../../NodeSet.js";
import { NodeType } from "../../NodeType.js";
import { NodeLink } from "../../NodeLink.js";
import { Item } from "../Item.js";
import { Property } from "./Property.js";


/** Defines a Class Instance of a data model. */
export class ClassInstance extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The class of the ClassInstance. */
	get class() { return this._class; }

	/** The properties of the ClassInstance. */
	get properties() { return this._properties; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a ClassInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, ClassInstance.type);

		// Initialize the child nodes
		this._class = new NodeLink('class', this);
		this._properties = new NodeSet('properties', this, Property.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the ClassInstance class. */
ClassInstance.type = new NodeType('ClassInstance', 'class_instance', Item.type, ClassInstance);
//# sourceMappingURL=ClassInstance.js.map