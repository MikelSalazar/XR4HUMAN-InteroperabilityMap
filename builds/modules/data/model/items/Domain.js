import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";
import { Model } from "../Model.js";

/** Defines a Domain of a data model. */
export class Domain extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent domain of the Domain. */
	get extends() { return this._extends; }

	/** The classes of the Domain. */
	get classes() { return this._classes; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Domain node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Domain.type);

		// Initialize the child nodes
		let model = this.ancestor(Model);
		this._extends = new NodeLink('extends', this, undefined, model ? model.domains : undefined);
		this._classes = new NodeLink('classes', this, undefined, model ? model.classes : undefined, 'domains');

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Domain class. */
Domain.type = new NodeType('Domain', 'domain', Item.type, Domain);
//# sourceMappingURL=Domain.js.map