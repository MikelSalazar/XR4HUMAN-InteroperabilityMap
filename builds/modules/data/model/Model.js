import { Node } from "../Node.js";
import { NodeSet } from "../NodeSet.js";
import { NodeType } from "../NodeType.js";
import { Class } from "./items/Class.js";
import { Domain } from "./items/Domain.js";
import { Relation } from "./items/Relation.js";


/** Defines a data Model. */
export class Model extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The list of domains of the Model. */
	get domains() { return this._domains; }

	/** The list of classes of the Model. */
	get classes() { return this._classes; }

	/** The list of relations of the Model. */
	get relations() { return this._relations; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Model instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent);

		// Initialize the child nodes
		this._domains = new NodeSet('domains', this, Domain.type);
		this._classes = new NodeSet('classes', this, Class.type);
		this._relations = new NodeSet('relations', this, Relation.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Node class. */
Model.type = new NodeType('Model', 'model', Node.type, Model);
//# sourceMappingURL=Model.js.map