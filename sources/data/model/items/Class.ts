import { Node } from "../../Node.js";
import { NodeSet } from "../../NodeSet.js";
import { NodeType } from "../../NodeType.js";
import { NodeLink } from "../../NodeLink.js";
import { Item } from "../Item.js";
import { Domain } from "./Domain.js";
import { Property } from "./Property.js";
import { ClassInstance } from "./ClassInstance.js";
import { Model } from "../Model.js";
import { Relation } from "./Relation.js";


/** Defines a Class of a data model. */
export class Class extends Item {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Class class. */
	static type = new NodeType('Class', 'class', Item.type, Class);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The parent class of the Class. */
	protected _extends: NodeLink<Class>;

	/** The domains the Class belong to. */
	protected _domains: NodeLink<Domain>;

	/** The relations the Class belong to. */
	protected _relations: NodeLink<Relation>;

	/** The properties of the Class. */
	protected _properties: NodeSet<Property>;

	/** The instances of the Class. */
	protected _instances: NodeSet<ClassInstance>;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent class of the Class. */
	get extends(): NodeLink<Class> { return this._extends; }

	/** The domain of the Class. */
	get domains(): NodeLink<Domain> { return this._domains; }

	/** The relations of the Class. */
	get relations(): NodeLink<Relation> { return this._relations; }

	/** The properties of the Class. */
	get properties(): NodeSet<Property> { return this._properties; }

	/** The instances of the Class. */
	get instances(): NodeSet<ClassInstance> { return this._instances; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Class node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, Class.type);

		// Initialize the child nodes
		let model = this.ancestor<Model>(Model);
		this._extends = new NodeLink<Class>('extends', this, undefined, 
			(model)? model.classes : undefined);
		this._domains = new NodeLink<Domain>('domains', this, undefined, 
			(model)? model.domains : undefined, 'classes');
		this._relations = new NodeLink<Relation>('relations', this, undefined, 
			(model)? model.relations : undefined, 'classes');
		this._properties = new NodeSet<Property>(
			'properties', this, Property.type);
		this._instances = new NodeSet<ClassInstance>(
			'instances', this, ClassInstance.type);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}