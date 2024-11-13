import { Item } from "../Item.js";
import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";


/** Defines a RelationInstance of a data model. */
export class RelationInstance extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The relation of the RelationInstance. */
	get relation() { return this._relation; }

	/** The origin of the RelationInstance. */
	get origin() { return this._origin; }

	/** The target of the RelationInstance. */
	get target() { return this._target; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a RelationInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, RelationInstance.type);

		// Initialize the child nodes
		this._relation = new NodeLink('relation', this);
		this._origin = new NodeLink('origin', this);
		this._target = new NodeLink('target', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}


// --------------------------------------------------------------- METADATA

/** The type metadata of the RelationInstance class. */
RelationInstance.type = new NodeType('RelationInstance', 'relation_instance', Item.type, RelationInstance);
//# sourceMappingURL=RelationInstance.js.map