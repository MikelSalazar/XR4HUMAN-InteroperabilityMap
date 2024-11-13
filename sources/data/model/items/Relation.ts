import { Node } from "../../Node.js";
import { NodeSet } from "../../NodeSet.js";
import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";
import { RelationInstance } from "./RelationInstance.js";
import { Class } from "./Class.js";
import { Model } from "../Model.js";


/** Defines a Relation of a data model. */
export class Relation extends Item {
	
	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Relation class. */
	static type = new NodeType('Relation', 'relation', Item.type, Relation);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The parent relation of the Relation. */
	protected _extends: NodeLink<Relation>;

	/** The classes of the Relation. */
	protected _classes: NodeLink<Class>

	/** The instances of the Relation. */
	protected _instances: NodeSet<RelationInstance>;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent relation of the Relation. */
	get extends(): NodeLink<Relation> { return this._extends; }

	/** The classes of the Relation. */
	get classes(): NodeLink<Class> { return this._classes; }

	/** The instances of the Relation. */
	get instances(): NodeSet<RelationInstance> { return this._instances; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Relation node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, Relation.type);

		// Initialize the child nodes
		let model = this.ancestor<Model>(Model);
		this._extends = new NodeLink<Relation>('extends', this, undefined,
			model? model.relations : undefined);
		this._classes = new NodeLink<Class>('classes', this, undefined,
			model? model.classes : undefined, 'relations');
		this._instances = new NodeSet<RelationInstance>(
			'instances', this, RelationInstance.type);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}
