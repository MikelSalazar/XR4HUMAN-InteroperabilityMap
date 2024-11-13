import { NodeType } from "./NodeType.js";


/** Defines a data node. */
export class Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Node class. */
	static type = new NodeType('Node', 'node', null, Node);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The name of the Node. */
	protected _name: string;

	/** The type of the node. */
	protected _type: NodeType;

	/** The update state of the Node. */
	protected _updated: boolean;

	/** The update time of the Node. */
	protected _updateTime: number;

	/** The debug data of the Node. */
	protected _debug: any;

	/** The parent Node of the Node. */
	protected _parent: Node | undefined;

	/** The child Node instances of the Node. */
	protected _children: Record<string, Node>;

	/** The special keys that should not be used during the serialization. */
	protected static _specialKeys: string[] = ['name', 'debug', 'type'];


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the Node. */
	get name(): string { return this._name; }

	/** The type of the node. */
	get type(): NodeType { return this._type; }

	/** The update state of the Node. */
	get updated(): boolean { return this._updated; }
	set updated(updated: boolean) {
		updated = (updated == true);
		if (!updated && this._parent) this._parent.updated = false;
		this._updated = updated;
	}

	/** The update time of the Node. */
	get updateTime() { return this._updateTime; }

	/** The debug data of the Node. */
	get debug(): any { return this._debug; }
	set debug(d: any) { this._debug = d; }

	/** The id (path) of the Node. */
	get id(): string {
		return (this._parent ? this._parent.id + '/' : '') + this._name;
	}

	/** The parent of the Node. */
	get parent(): Node | undefined { return this._parent; }

	/** The children of the Node. */
	get children(): Node[] { return Object.values(this._children) };


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Node instance.
	 * @param name The name of the Node.
	 * @param parent The parent of the Node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name: string, parent?: Node, data: any = {},
		type: NodeType = Node.type) {

		// Set the name and type of the node
		this._name = name || data.name;
		if (!this._name || Node._specialKeys.includes(this._name))
			throw Error('Invalid node name "' + this.name + '"');
		this._type = type;
		if (!this._type) throw Error('Invalid node type for: ' + this.id);

		// Establish the connection to the parent
		this._children = {}; this._parent = parent;
		if (parent) {
			if (parent._children[this._name]) throw Error(
				'Repeated key: "' + this._name + '" for ' + parent.id);
			parent._children[this._name] = this;
			if (parent._updated) parent.updated = false;
		}

		// By default, the node is not updated
		this._updated = false;

		// Show a debug message on console
		this._debug = data.debug;
		if (this._debug) console.log('Created ' + this._type.name +
			' "' + this.id + '"');
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Retrieves an ancestor node of an specific type.
	 * @param type The type of node.
	 * @returns The first node that matches the condition. */
	ancestor<NodeType>(type: any) {
		let node: Node = this.parent;
		while (node) { if (node instanceof type) break; node = node.parent; }
		return node as NodeType;
	}


	/** Gets an specific child the Node.
	 * @param key The name of the child to get.
	 * @returns The specific Node requested (undefined if not found). */
	get(key: string): Node { return this._children[key]; }


	/** Updates the Node instance.
	 * @param forced Whether to force the update or not. 
	 * @return Whether the node has been updated or not*/
	update(forced: boolean = false): boolean {

		// Check if the node has to be updated
		if (this._updated && !forced) return;

		// Show a debug message
		// if (this.debug) console.log('Updated ' + this.id);

		// Update the child nodes (and check if they have been updated)
		this._updated = true
		for (let child of this.children)
			if (!child.update(forced)) this._updated = false;

		// Save the update time (even if it is not updated)
		this._updateTime = Date.now();

		// Return the current state
		return this._updated;
	}


	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data: any = {}) {

		// Check the data 
		if (data == undefined || typeof data != 'object') return;

		// Save the debug data
		this._debug = data.debug;

		// Get the child node data
		for (let key in data) {
			if (Node._specialKeys.includes(key)) continue;
			if (this._children[key] != undefined)
				this._children[key].deserialize(data[key]);
			else console.warn('Unknown child node "' + key + '" for' + this.id);
		}
	}


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params: any = {}): any {

		// Create the data of the 
		let data: any = {}, itemCount = 0;

		// Set the name
		if (this._name) data.name = this._name;

		// Serialize the child nodes (excluding "undefined" values)
		for (let key in this._children) {
			let item = this._children[key].serialize(params);
			if (item == undefined) continue;
			data[key] = item; itemCount++;
		}

		// Return the data (if there is data to return)
		return (params.optimize && itemCount == 0) ? undefined : data;
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString(): string { return JSON.stringify(this.serialize()); }


	/** Iterates through the children of the Node. */
	[Symbol.iterator]() {
		let pointer = 0, items = Object.values(this._children);
		return {
			next(): IteratorResult<Node> {
				if (pointer < items.length)
					return { done: false, value: items[pointer++] }
				else return { done: true, value: null };
			}
		}
	}
}