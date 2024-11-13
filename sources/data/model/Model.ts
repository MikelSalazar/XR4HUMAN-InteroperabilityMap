import { Node } from "../Node.js";
import { NodeSet } from "../NodeSet.js";
import { NodeType } from "../NodeType.js";
import { Class } from "./items/Class.js";
import { Domain } from "./items/Domain.js";
import { Relation } from "./items/Relation.js";


/** Defines a data Model. */
export class Model extends Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Node class. */
	static type = new NodeType('Model', 'model', Node.type, Model);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The list of domains of the Model. */
	protected _domains: NodeSet<Domain>;

	/** The list of classes of the Model. */
	protected _classes: NodeSet<Class>;

	/** The list of relations of the Model. */
	protected _relations: NodeSet<Relation>;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The list of domains of the Model. */
	get domains(): NodeSet<Domain> { return this._domains; }

	/** The list of classes of the Model. */
	get classes(): NodeSet<Class> { return this._classes; }

	/** The list of relations of the Model. */
	get relations(): NodeSet<Relation> { return this._relations; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Model instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent);

		// Initialize the child nodes
		this._domains = new NodeSet<Domain>('domains', this, Domain.type);
		this._classes = new NodeSet<Class>('classes', this, Class.type);
		this._relations = new NodeSet<Relation>(
			'relations', this, Relation.type);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}

}