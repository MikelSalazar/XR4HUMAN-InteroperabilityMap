import { Node } from "../../Node.js";
import { NodeSet } from "../../NodeSet.js";
import { NodeType } from "../../NodeType.js";
import { NodeLink } from "../../NodeLink.js";
import { Item } from "../Item.js";
import { Class } from "./Class.js";
import { Property } from "./Property.js";


/** Defines a Class Instance of a data model. */
export class ClassInstance extends Item {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the ClassInstance class. */
	static type = new NodeType('ClassInstance', 'class_instance', 
		Item.type, ClassInstance);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The class of the ClassInstance. */
	protected _class: NodeLink<Class>;

	/** The properties of the ClassInstance. */
	protected _properties: NodeSet<Property>


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The class of the ClassInstance. */
	get class(): NodeLink<Class> { return this._class; }

	/** The properties of the ClassInstance. */
	get properties(): NodeSet<Property> { return this._properties; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a ClassInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, ClassInstance.type);

		// Initialize the child nodes
		this._class = new NodeLink<Class>('class', this);
		this._properties = new NodeSet<Property>(
			'properties', this, Property.type);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}