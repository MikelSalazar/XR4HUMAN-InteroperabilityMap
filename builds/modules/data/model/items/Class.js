import { NodeSet } from "../../NodeSet.js";
import { NodeType } from "../../NodeType.js";
import { NodeLink } from "../../NodeLink.js";
import { Item } from "../Item.js";
import { Property } from "./Property.js";
import { ClassInstance } from "./ClassInstance.js";
import { Model } from "../Model.js";


/** Defines a Class of a data model. */
export class Class extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent class of the Class. */
	get extends() { return this._extends; }

	/** The domain of the Class. */
	get domains() { return this._domains; }

	/** The relations of the Class. */
	get relations() { return this._relations; }

	/** The properties of the Class. */
	get properties() { return this._properties; }

	/** The instances of the Class. */
	get instances() { return this._instances; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Class node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Class.type);

		// Initialize the child nodes
		let model = this.ancestor(Model);
		this._extends = new NodeLink('extends', this, undefined, (model) ? model.classes : undefined);
		this._domains = new NodeLink('domains', this, undefined, (model) ? model.domains : undefined, 'classes');
		this._relations = new NodeLink('relations', this, undefined, (model) ? model.relations : undefined, 'classes');
		this._properties = new NodeSet('properties', this, Property.type);
		this._instances = new NodeSet('instances', this, ClassInstance.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Class class. */
Class.type = new NodeType('Class', 'class', Item.type, Class);
//# sourceMappingURL=Class.js.map