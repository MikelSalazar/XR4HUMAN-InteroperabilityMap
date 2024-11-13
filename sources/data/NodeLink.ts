import { Node } from "./Node.js"
import { NodeType } from "./NodeType.js";


/** Defines a Node that links to another Node instance. */
export class NodeLink<SubNodeType extends Node> extends Node {

	
	// --------------------------------------------------------------- METADATA

	/** The type metadata of the NodeLink class. */
	static type = new NodeType('Link', 'link', null, NodeLink);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The origin of the NodeLink. */
	protected _origin: Node;

	/** The name of the inverse NodeLink. */
	protected _inverse: string;

	/** The references of the NodeLink. */
	protected _references: string[];

	/** The linked Node instances of the NodeLink. */
	protected _children: Record<string, SubNodeType>;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The references of the NodeLink. */
	get references(): string[] { return this._references;}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Initializes the NodeLink node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param origin The origin of the NodeLink.
	 * @param inverse The name of the inverse NodeLink. */
	constructor(name: string, parent?: Node, data?: any,
		origin?: Node, inverse?: string) {

		// Call the base class constructor
		super(name, parent, undefined, NodeLink.type);

		// Set the origin of the reference and the inverse link
		this._origin = origin; this._inverse = inverse;

		// Initialize the references of the link
		this._references = []; 
	
		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the NodeLink instance.
	 * @param forced Whether to force the update or not. 
	 * @return Whether the node has been updated or not*/
	update(forced: boolean = false) : boolean {

		// Check if the node has to be updated
		if (this._updated && !forced) return;

		// Add the nodes references
		this._children = {};
		for (let reference of this._references) {
			let node = this._origin.get(reference) as SubNodeType;
			if (!node) throw Error('Invalid reference "' + reference + '"' +
				' for: ' + this.id);
			this._children[reference] = node;
			if (this._inverse) {
				let inverseLink = (node as any)[this._inverse]as NodeLink<Node>;
				if (!inverseLink) throw Error('Inverse link "' + this._inverse +
					'" not found in ' + node.id);
				let inverseNode = this.parent;
				if (!inverseLink._children[inverseNode.name]) {
					inverseLink._references.push(inverseNode.name);
					inverseLink._children[inverseNode.name] = inverseNode;
				}
			}
		}

		// Mark the node as updated (do not update the children nodes)
		return this._updated = true;
	}


	/** Deserializes JSON data into the NodeLink instance.
	 * @param data The deserialization data. */
	deserialize(data: any) { 
		if (Array.isArray(data)){
			this._references = [];
			for (let reference of data) this._references.push(reference);
		} else throw Error('Invalid data for: ' + this.id);
	 }


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params: any = {}): any { 
		return (this._references.length > 0)? this.references : undefined; 
	}
}