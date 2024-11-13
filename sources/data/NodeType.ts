/** Defines the metadata of a node. */
export class NodeType {

	// ------------------------------------------------------- PROTECTED FIELDS

	/** The name of the NodeType. */
	protected _name: string;

	/** The tag of the NodeType. */
	protected _tag: string;

	/** Indicates whether to serialize the node or not. */
	protected _serializable: boolean;

	/** The parent NodeType. */
	protected _parent: NodeType;

	/** The child NodeTypes. */
	protected _children: Record<string, NodeType>;

	/** The number of the child NodeTypes. */
	protected _childCount: number;

	/** The tags of the child NodeTypes. */
	protected _childTags: Record<string, NodeType>;

	/** The prototype of the NodeType. */
	protected _prototype: NodeType;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the NodeType. */
	get name(): string { return this._name; }

	/** The tag of the NodeType. */
	get tag(): string { return this._tag; }

	/** Indicates whether to serialize the node or not. */
	get serializable(): boolean { return this._serializable; }

	/** The name of the NodeType. */
	get parent(): NodeType { return this._parent; }

	/** The child NodeTypes. */
	get children(): Record<string, NodeType> { return this._children; }

	/** Gets the number of child NodeTypes. */
	get childCount(): number { return this._childCount }

	/** Gets the names of child NodeTypes. */
	get childTags(): Record<string, NodeType> { return this._childTags; }

	/** The prototype of the NodeType. */
	get prototype(): NodeType { return this._prototype; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Node instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param prototype The prototype of the NodeType. */
	constructor(name: string, tag: string, parent?: NodeType, prototype?: any) {
		
		// Save the provided data
		this._name = name; this._tag = tag || name.toLowerCase();

		// Initialize the children list and link to the parent
		this._parent = parent; this._children = {}; 
		this._childCount = 0; this._childTags = {};
		if (parent) { 
			parent._children[name] = parent._childTags[tag] = this;
			parent._childCount++;
		}

		// Save the prototype
		this._prototype = prototype;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Checks if the NodeType is of a particular type or not.
	 * @param typeName The name of the type we are searching for.
	 * @returns A boolean value indicating if the NodeType is correct.  */
	is(typeName: string): boolean {
		if (this._name == typeName) return true;
		if (this._parent != undefined && this._parent.is(typeName)) return true;
		return false;
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() { return this._name; }
}
