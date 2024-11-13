import { NodeType } from "../../data/NodeType.js";
import { String } from "../../data/types/simple/String.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";


/** Defines a Graphic Widget */
export class Graphic extends Widget {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The resource of the Graphic. */
	get resource() { return this._resource; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Graphic instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, undefined, Graphic.type);

		// Initialize the child nodes
		this._resource = new String('resource', this);

		// Create the use component
		this._useComponent = new Component('use', this._component);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Graphic instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced)
			return;

		// 
		if (!this._resource.updated) {
			let r = this._resource.value;
			this._useComponent.setAttribute('href', '#' + r);
			this._useComponent.setAttribute('xlink:href', '#' + r);
		}

		// Call the base class method
		return super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Graphic class. */
Graphic.type = new NodeType('Graphic', 'graphic', Widget.type, Graphic);
//# sourceMappingURL=Graphic.js.map