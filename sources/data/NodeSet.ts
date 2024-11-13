import { Node } from "./Node.js"
import { NodeType } from "./NodeType.js";

/** Defines a NodeSet. */
export class NodeSet<ChildType extends Node> extends Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the NodeSet class. */
	static type = new NodeType('NodeSet', 'set', Node.type, NodeSet);

	// --------------------------------------------------------- PRIVATE FIELDS

	/** The child Node instances of the Node. */
	protected _children: Record<string, ChildType>;

	/** The type of the Node instances in the NodeSet. */
	protected _type: NodeType;

	/** Indicates whether the NodeSet uses indexes or not. */
	protected _indexed: boolean;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the NodeSet. */
	get name(): string { return this._name; }

	/** The type of the Node instances in the NodeSet. */
	get type(): NodeType { return this._type };

	/** Indicates whether the NodeSet uses indexes or not. */
	get indexed(): boolean { return this._indexed; }

	/** The keys of the Nodes of the NodeSet. */
	get keys(): string[] { return Object.keys(this._children); }

	/** The children of the NodeSet. */
	get children(): ChildType[] { return Object.values(this._children) };

	/** The number of items of the NodeSet. */
	get count(): number { return this.children.length; }

	/** The first item of the NodeSet. */
	get first(): ChildType { return this.children[0]; }

	/** The last item of the NodeSet. */
	get last(): ChildType { return this.children[this.children.length - 1]; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new NodeSet instance.
	 * @param name The name of the NodeSet.
	 * @param owner The parent Node.
	 * @param type The type of the Node instances in the NodeSet.
	 * @param data The initialization data. */
	constructor(name: string, parent: Node, type: NodeType, data?: any) {

		// Call the base class constructor
		super(name, parent, undefined, NodeSet.type);

		// Save the type of the Node instances
		if (!type) throw Error('Invalid node type for: ' + this.id);
		this._type = type;

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets an specific Node instance of the NodeSet.
	 * @param key The name or index of the Node to get.
	 * @returns The specific Node requested (undefined if not found). */
	get(key: any): ChildType {
		if (typeof key == 'string') return this._children[key];
		else if (typeof key == 'number') {
			let keys = window.Object.keys(this._children);
			if (key < 0 || key > keys.length)
				console.warn('Invalid index "' + key + '" for: ' + this.id);
			return this._children[keys[key]];
		}
		else console.warn('Invalid index "' + key + '" for: ' + this.id);
	}


	/** Deserializes JSON data into the NodeSet.
	 * @param data The deserialization data. */
	deserialize(data: any) {

		// Make sure there is data to deserialize
		if (data == undefined) return;

		// Get the items of the NodeSet
		if (Array.isArray(data)) {
			this._indexed = true; let index = 1;
			for (let item of data) {
				let nodeType: any = this._type;
				if (item.type) {
					nodeType = this._type.childTags[item.type];
					if (!nodeType) throw Error(
						'Invalid type: "' + item.type + '" for: ' + this.id);
				}
				new nodeType.prototype('' + index++, this, item);
			}
		} else if (typeof data == 'object') {
			this._indexed = false;
			for (let key in data) {
				let item = data[key], nodeType: any = this._type;
				if (item.type) {
					nodeType = this._type.childTags[item.type];
					if (!nodeType) throw Error(
						'Invalid type: "' + item.type + '" for: ' + this.id);
				}
				new nodeType.prototype(key, this, item);
			}
		} else throw Error('Invalid data "' + data + '" for: ' + this.id);
	}


	/** Serializes the NodeSet to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params: any = {}): any {
		if (this._indexed == true) {
			// Create the array to store the JSON representation
			let array: ChildType[] = [];

			// Serialize the nodes
			let children = Object.values(this._children);
			for (let child of children) array.push(child.serialize());

			// Return the JSON representation
			return (array.length > 0 ? array : undefined);
		} else {
			// Create the array to store the JSON representation
			let obj: Record<string, ChildType> = {}, itemCount = 0;

			// Serialize the nodes
			for (let childName in this._children) {
				let item = this._children[childName].serialize();
				if (item != undefined) { obj[childName] = item; itemCount++; }
			}

			// Return the JSON representation
			return (itemCount > 0 ? obj : undefined);
		}
	}


	/** Obtains the string representation of the NodeSet.
	 * @returns The string representation of the NodeSet. */
	toString(): string {
		let text = JSON.stringify(this.serialize());
		return this.name + ': ' + (text ? text : '[]');
	}


	/** Iterates through the items of the NodeSet. */
	[Symbol.iterator]() {
		let pointer = 0, items = Object.values(this._children);
		return {
			next(): IteratorResult<ChildType> {
				if (pointer < items.length)
					return { done: false, value: items[pointer++] }
				else return { done: true, value: null };
			}
		}
	}
}