import { Item } from "../Item.js";
import { Node } from "../../Node.js";
import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";
import { Relation } from "./Relation.js";
import { Class } from "./Class.js";


/** Defines a RelationInstance of a data model. */
export class RelationInstance extends Item {


	// --------------------------------------------------------------- METADATA

	/** The type metadata of the RelationInstance class. */
	static type = new NodeType('RelationInstance', 'relation_instance', 
		Item.type, RelationInstance);


	// ------------------------------------------------------- PROTECTED FIELDS
	
	/** The relation of the RelationInstance. */
	protected _relation: NodeLink<Relation>;

	/** The origin of the RelationInstance. */
	protected _origin: NodeLink<Class>;

	/** The target of the RelationInstance. */
	protected _target: NodeLink<Class>;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The relation of the RelationInstance. */
	get relation(): NodeLink<Relation> { return this._relation; }

	/** The origin of the RelationInstance. */
	get origin(): NodeLink<Class> { return this._origin; }

	/** The target of the RelationInstance. */
	get target(): NodeLink<Class> { return this._target; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a RelationInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, RelationInstance.type);

		// Initialize the child nodes
		this._relation = new NodeLink<Relation>('relation', this);
		this._origin = new NodeLink<Class>('origin', this);
		this._target = new NodeLink<Class>('target', this);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}