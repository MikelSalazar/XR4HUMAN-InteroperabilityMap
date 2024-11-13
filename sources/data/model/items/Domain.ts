import { Node } from "../../Node.js";
import { NodeLink } from "../../NodeLink.js";
import { NodeType } from "../../NodeType.js";
import { Item } from "../Item.js";
import { Class } from "./Class.js";
import { Model } from "../Model.js";

/** Defines a Domain of a data model. */
export class Domain extends Item {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Domain class. */
	static type = new NodeType('Domain', 'domain', Item.type, Domain);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The parent domain of the Domain. */
	protected _extends: NodeLink<Domain>;

	/** The classes of the Domain. */
	protected _classes: NodeLink<Class>


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent domain of the Domain. */
	get extends(): NodeLink<Domain> { return this._extends; }

	/** The classes of the Domain. */
	get classes(): NodeLink<Class> { return this._classes; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Domain node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name: string, parent?: Node, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, Domain.type);

		// Initialize the child nodes
		let model = this.ancestor<Model>(Model);
		this._extends = new NodeLink<Domain>('extends', this, undefined,
			model? model.domains : undefined);
		this._classes = new NodeLink<Class>('classes', this, undefined,
			model? model.classes : undefined, 'domains');

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}
}