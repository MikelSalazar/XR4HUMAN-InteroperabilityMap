import { NodeSet } from "../../NodeSet.js";
import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";
import { RelationInstance } from "./RelationInstance.js";
import { Model } from "../Model.js";


/** Defines a Relation of a data model. */
export class Relation extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent relation of the Relation. */
	get extends() { return this._extends; }

	/** The classes of the Relation. */
	get classes() { return this._classes; }

	/** The instances of the Relation. */
	get instances() { return this._instances; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Relation node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Relation.type);

		// Initialize the child nodes
		let model = this.ancestor(Model);
		this._extends = new NodeLink('extends', this, undefined, model ? model.relations : undefined);
		this._classes = new NodeLink('classes', this, undefined, model ? model.classes : undefined, 'relations');
		this._instances = new NodeSet('instances', this, RelationInstance.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Relation class. */
Relation.type = new NodeType('Relation', 'relation', Item.type, Relation);

//# sourceMappingURL=Relation.js.map