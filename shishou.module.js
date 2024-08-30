/** Defines the metadata of a data node. */
export class NodeType {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Node instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param prototype The prototype of the NodeType. */
	constructor(name, tag, parent, prototype) {

		// Save the provided data
		this._name = name;
		this._tag = tag || name.toLowerCase();

		// Initialize the children list and link to the parent
		this._parent = parent;
		this._children = {};
		this._childCount = 0;
		this._childTags = {};
		if (parent) {
			parent._children[name] = parent._childTags[tag] = this;
			parent._childCount++;
		}

		// Save the prototype
		this._prototype = prototype;
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the NodeType. */
	get name() { return this._name; }

	/** The tag of the NodeType. */
	get tag() { return this._tag; }

	/** Indicates whether to serialize the instances of NodeType or not. */
	get serializable() { return this._serializable; }

	/** The name of the NodeType. */
	get parent() { return this._parent; }

	/** The child NodeTypes. */
	get children() { return this._children; }

	/** Gets the number of child NodeTypes. */
	get childCount() { return this._childCount; }

	/** Gets the names of child NodeTypes. */
	get childTags() { return this._childTags; }

	/** The prototype of the NodeType. */
	get prototype() { return this._prototype; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Checks if the NodeType is of a particular type or not.
	 * @param typeName The name of the type we are searching for.
	 * @returns A boolean value indicating if the NodeType is correct.  */
	is(typeName) {
		if (this._name == typeName)
			return true;
		if (this._parent != undefined && this._parent.is(typeName))
			return true;
		return false;
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() { return this._name; }
}






/** Defines a data node. */
export class Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Node instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The node type. */
	constructor(name, parent, data, type = Node.type) {

		// Save the provided data
		this._name = name;
		this._type = type;

		// Check the provided node name
		if (!name || Node.reservedWords.includes(name))
			throw Error('Invalid node name: ' +
				(!name ? "(undefined)" : '"' + name + '"') +
				(parent ? ' for: ' + parent.nodePath : ''));

		// Initialize the children list
		this._parent = parent;
		this._children = {};

		// Link to the parent ensuring the name is not repeated
		if (parent) {
			let uniqueName = this._name, nameIndex = 1;
			while (parent.children[uniqueName])
				uniqueName = this._name + nameIndex++;
			parent.children[uniqueName] = this;
		}

		// Initialize the list of links
		this._links = [];

		// Deserialize the initialization data
		this._serializable = true;
		if (data != undefined)
			this.deserialize(data);

		// Initially, mark the node has not updated
		this._updated = false;
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Marks the instance as a Node. */
	get isNode() { return true; }

	/** The name of the node. */
	get name() { return this._name; }

	/** The type of the node. */
	get type() { return this._type; }

	/** The name of the node. */
	get parent() { return this._parent; }

	/** The child nodes. */
	get children() { return this._children; }

	/** The NodeLinks associated to the node. */
	get links() { return this._links; }

	/** The path of the node. */
	get nodePath() {
		return (this._parent ? this._parent.nodePath + '/' : '') + this._name;
	}

	/** Indicates whether the node is updated or not. */
	get updated() { return this._updated; }
	set updated(updated) {
		if (updated == false) {
			if (this._parent)
				this._parent.updated = false;
			for (let link of this._links)
				link.updated = false;
		}
		this._updated = updated;
	}

	/** Indicates whether the node is serializable or not. */
	get serializable() { return this._serializable; }
	set serializable(serializable) { this._serializable = serializable; }

	/** The debug data of the node. */
	get debug() { return this._debug; }
	set debug(d) { this._debug = d; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Node instance.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time = 0, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		// Update the child nodes
		let children = Object.values(this._children);
		for (let child of children) {
			child.update(time, forced);
		}

		// Mark the node as updated
		this._updated = true;
	}


	/** Deserializes a data object into the instance.
	 * @param data The data object of the instance. */
	deserialize(data) {

		// Check the data 
		if (data == undefined)
			return;

		// Get the data items (in the provided order)
		let items = Object.keys(data);
		for (let item of items)
			if (this._children[item] != undefined && data[item] != undefined)
				this.children[item].deserialize(data[item]);

		// Get the debug data
		if (data.debug)
			this._debug = data;
	}


	/** Serializes the instance to a data object.
	 * @param options The serialization options.
	 * @returns An object with the data of the instance. */
	serialize(options = {}) {

		// // Check if the node is serializable
		// if (!this.serializable) return;

		// // Create the data object
		// let data: any = { }, itemCount = 0;
		// if (this._name) data.name = this._name;
		// if (this._type && !options.optimize) data.type = this._type.tag;

		// // Serialize the child nodes (excluding "undefined" values)
		// for (let childName in this._children) {
		// 	let item = this._children[childName].serialize(options);
		// 	data[childName] = item; itemCount++; 
		// }

		// // Return the data (if there is data to return)
		// return (!options.optimize || itemCount > 0)? data : undefined;

		// Check if the node is serializable
		if (!this.serializable)
			return;

		// Create the data object
		let data = {}, itemCount = 0;
		if (this._name)
			data.name = this._name;
		if (this._type)
			data.type = this._type.tag;

		// Serialize the child nodes (excluding "undefined" values)
		for (let childName in this._children) {
			let item = this._children[childName].serialize(options);
			data[childName] = item;
			itemCount++;
		}

		// Return the data (if there is data to return)
		return (itemCount > 0) ? data : undefined;
	}


	/** Serializes the instance to a string representation.
	 * @returns The string representation with the data of the instance. */
	toString() {
		return JsonSerialization.serialize(this, { optimize: false });
	}


	/** Gets an ancestor node.
	 * @param type The type of the node ancestor.
	 * @returns The ancestor node, if found. */
	ancestor(type) {
		let searchNode = this._parent;
		while (searchNode != null) {
			if (searchNode._type.is(type.name))
				return searchNode;
			searchNode = searchNode.parent;
		}
	}


	/** Gets an relative node.
	 * @param path The relative path of the node.
	 * @returns The relative node, if found. */
	relative(path) {
		let node = this;
		let parts = path.split('/');
		for (let part of parts) {
			if (part == '..') {
				if (node._parent)
					node = node._parent;
				else
					throw Error('There in no parent node for:' + node.nodePath);
			}
			else {
				let child;
				if (node._type.name == 'NodeSet')
					child = node.get(part);
				else
					child = node._children[part];
				if (!child)
					throw Error('Invalid child node: "' + part +
						'" for:' + node.nodePath);
				node = child;
			}
		}
		return node;
	}


	/** Iterates through the child nodes of the node. */
	[Symbol.iterator]() {
		let pointer = 0, nodes = Object.values(this._children);
		return {
			next() {
				if (pointer < nodes.length)
					return { done: false, value: nodes[pointer++] };
				else
					return { done: true, value: null };
			}
		};
	}

	// --------------------------------------------------------- STATIC METHODS

	/** Checks if one or multiple nodes have been modified.
	 * @param nodes The list of nodes to check.
	 * @returns A boolean value indicating whether the nodes are updated or not. */
	static modified(...nodes) {
		for (let node of nodes) {
			if (node.updated == false)
				return true;
		}
		return false;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Node class. */
Node.type = new NodeType('Node', 'node', undefined, Node);

/** Special reserved words that can not be used as node names. */
Node.reservedWords = ['name', 'debug'];






/** Defines a collection of nodes. */
export class NodeSet extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the NodeSet instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param itemType The node type of the items of the Node Set.
	 * @param data The initialization data. */
	constructor(name, parent, itemType, data) {

		// Call the base class constructor
		super(name, parent, undefined, NodeSet.type);

		// Check the given data
		if (!itemType)
			throw Error('Invalid itemType for: ' + this.nodePath);

		// Save the provided data
		this._itemType = itemType;
		this._indexed = false;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The child nodes of the NodeSet. */
	get children() { return this._children; }

	/** The node type of the items pf the NodeSet. */
	get itemType() { return this._itemType; }

	/** Indicates whether the NodeSet uses indexes or not. */
	get indexed() { return this._indexed; }

	/** Gets the name of child nodes. */
	get names() { return Object.keys(this.children); }

	/** Gets the number of child nodes. */
	get count() { return Object.keys(this.children).length; }

	/** Gets first child node. */
	get first() { return this.getByIndex(0); }

	/** Gets last child node. */
	get last() { return this.getByIndex(this.count - 1); }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Adds a child to the NodeSet.
	 * @param name The name of the child node.
	 * @param data The data of the child node. */
	add(name, data) {
		let itemType = this._itemType;
		if (!name)
			name = data.name;
		if (!name)
			name = this._itemType.name + '_' + (this.count + 1);
		if (itemType.childCount > 0 && data.type && data.type != itemType.tag) {
			let subItemType = itemType.childTags[data.type];
			if (!subItemType)
				throw Error('Invalid Node type for: "' +
					this.nodePath + '". Valid node types are: "' +
					Object.keys(itemType.childTags).join('", "') + '"');
			itemType = subItemType;
		}
		return new itemType.prototype(data.name || name, this, data);
	}


	/** Get a particular item in the NodeSet.
	 * @param key The key of the item to get.
	 * @returns The requested item. */
	get(key) { return this._children[key]; }


	/** Get a particular item in the NodeSet.
	 * @param key The key of the item.
	 * @returns The requested item. */
	getByIndex(index) {
		return Object.values(this._children)[index];
	}


	/** Get a particular item in the NodeSet.
	 * @param key The key of the item.
	 * @returns The requested item. */
	remove(key) { this._children[key] = undefined; }


	/** Get a particular item in the NodeSet.
	* @param index The index of the item.
	* @returns The requested item. */
	removeByIndex(index) {
		this._children[(Object.keys(this._children)[index])] = undefined;
	}


	/** Removes all the children of the NodeSet  */
	clear() { this._children = {}; }


	/** Deserializes a data item into the NodeSet instance.
	 * @param data The initialization data. */
	deserialize(data) {

		// Check the data 
		if (data == undefined)
			return;

		// Get the items of the node set
		if (Array.isArray(data)) {
			this._indexed = true;
			let index = 0;
			for (let value of data)
				this.add(undefined, value);
		}
		else if (typeof data == 'object') {
			this._indexed = false;
			for (let key in data)
				this.add(key, data[key]);
		}
		else
			throw Error('Invalid node set data');
	}


	/** Serializes the NodeSet instance to a data object.
	 * @param options The serialization options.
	 * @returns An object with the data of the instance. */
	serialize(options = {}) {
		if (this._indexed == true) {
			// Create the array to store An object
			let array = [];

			// Serialize the nodes
			let children = Object.values(this._children);
			for (let child of children)
				array.push(child.serialize(options));

			// Return the array
			return (array.length > 0 ? array : undefined);
		}
		else {
			// Create the array to store An object
			let obj = {}, itemCount = 0;

			// Serialize the nodes
			for (let childName in this._children) {
				let item = this.children[childName].serialize(options);
				if (item == undefined)
					continue;
				if (options.removeTyping) {
					if (!this.indexed && item.name == childName)
						item.name = undefined;
					if (item.type == this._itemType.tag)
						item.type = undefined;
				}
				obj[childName] = item;
				itemCount++;
			}

			// Return the object
			let keyCount = Object.keys(obj).length;
			return (options.optimize && keyCount == 0) ? undefined : obj;
		}
	}


	/** Iterates through the child nodes of the NodeSet. */
	[Symbol.iterator]() {
		let pointer = 0, nodes = Object.values(this._children);
		return {
			next() {
				if (pointer < nodes.length)
					return { done: false, value: nodes[pointer++] };
				else
					return { done: true, value: null };
			}
		};
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the NodeSet class. */
NodeSet.type = new NodeType('NodeSet', 'set', Node.type, NodeSet);




/** Defines a node that links to another node. */
export class NodeLink extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Initializes the NodeLink node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, NodeLink.type);

		// Initialize the elements of the link
		this._origin = '';
		this._reference = undefined;
		this._strength = 1;
		this._node = undefined;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The origin of the NodeLink. */ ;

	/** The reference of the NodeLink. */ ;

	/** The strength of the NodeLink. */ ;

	/** The linked Node of the NodeLink. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The origin of the NodeLink. */ ;
	get origin() { return this._origin; }

	/** The reference to the linked node. */ ;
	get reference() { return this._reference; }
	set reference(r) {
		if (this._reference == r)
			return;
		this._reference = r;
		this.updated = false;
	}

	/** The strength of the NodeLink. */ ;
	get strength() { return this._strength; }
	set strength(s) {
		if (this._strength == s)
			return;
		this._strength = s;
		this.updated = false;
	}

	/** The linked Node of the NodeLink. */ ;
	get node() { return this._node; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the NodeLink instance.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time = 0, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._reference)
			return;

		// Go upwards in the hierarchy
		let parts = (this._origin + this._reference).split('/'), upwards = this._parent, downwards;
		while (parts[0] == '..') {
			parts.shift();
			if (upwards.parent)
				upwards = upwards.parent;
		}

		// Look for the node downwards
		this._node = undefined;
		let partIndex = 0, partCount = parts.length;
		while (upwards && !this._node) {
			downwards = upwards;
			upwards = upwards.parent;
			for (partIndex = 0; partIndex < partCount; partIndex++) {
				let part = parts[partIndex];
				downwards = downwards.children[part];
				if (!downwards)
					break;
				if (partIndex == partCount - 1)
					this._node = downwards;
			}
		}
		// this._node = this._parent.relative('../' + r) as SubNodeType;

		// Add this link to the list in the node itself
		if (this._node) {
			this._node.links.push(this);
			// console.log('Node Linked: ' + this.nodePath + ' < ' + this._node.nodePath);
		}
		else
			console.log('No link found for: "' + this.nodePath +
				'" using reference "' + this._reference + '"');

		// Mark the node as updated
		this._updated = true;
	}


	/** Deserializes a data item into the NodeLink instance.
	 * @param data The initialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'object':
				this._reference = data.reference;
				this._origin = data.origin || '';
				this._strength = data.strength || 1;
				break;
			case 'string':
				this._reference = data;
				break;
			default: throw Error('Invalid reference for: ' + this.nodePath);
		}
	}


	/** Serializes the NodeLink instance to a data object.
	 * @returns An object with the data of the NodeLink instance. */
	serialize() { return this.reference; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the NodeLink class. */
NodeLink.type = new NodeType('Link', ' link', Node.type, NodeLink);






/** Defines a collection of NodeLink instances. */
export class NodeLinkSet extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the NodeLinkSet instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param itemType The node type of the items of the NodeLinkSet.
	 * @param data The initialization data. */
	constructor(name, parent, itemType, data, origin = '') {

		// Call the base class constructor
		super(name, parent, undefined, NodeLinkSet.type);

		// Check the given data
		if (!name)
			throw Error('No name provided for: ' + this.nodePath);
		if (!itemType)
			throw Error('Invalid itemType for: ' + this.nodePath);

		// Save the provided data
		this._itemType = itemType;
		this._indexed = undefined;
		this._origin = origin;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The origin to the NodeLinkSet. */
	get origin() { return this._origin; }

	/** The child nodes of the NodeLinkSet. */
	get children() { return this._children; }

	/** The node type of the items pf the NodeLinkSet. */
	get itemType() { return this._itemType; }

	/** Indicates whether the NodeLinkSet uses indexes or not. */
	get indexed() { return this._indexed; }

	/** Gets the name of NodeLinks. */
	get names() { return Object.keys(this.children); }

	/** Gets the number of NodeLinks. */
	get count() { return Object.keys(this.children).length; }

	/** Gets first NodeLink. */
	get first() { return this.getChildByIndex(0); }

	/** Gets last NodeLink. */
	get last() { return this.getChildByIndex(this.count - 1); }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Adds a child to the NodeLinkSet.
	 * @param name The name of the child node.
	 * @param data The data of the child node. */
	addChild(name, data) {
		let itemType = this._itemType;
		if (itemType.childCount > 0 && data.type && data.type != itemType.tag) {
			let subItemType = itemType.childTags[data.type];
			if (!subItemType)
				throw Error('Invalid Node type for: "' +
					this.nodePath + '". Valid node types are: "' +
					Object.keys(itemType.childTags).join('", "') + '"');
			itemType = subItemType;
		}
		return new NodeLink(data.name || name, this, data);
	}


	/** Get a particular NodeLink in the NodeLinkSet.
	 * @param key The key of the item to get.
	 * @returns The requested item. */
	getChild(key) { return this._children[key]; }


	/** Get a particular NodeLink in the NodeLinkSet.
	 * @param key The key of the item.
	 * @returns The requested item. */
	getChildByIndex(index) {
		return Object.values(this._children)[index];
	}


	/** Get a particular NodeLink in the NodeLinkSet.
	 * @param key The key of the item.
	 * @returns The requested item. */
	remove(key) { this._children[key] = undefined; }


	/** Get a particular NodeLink in the NodeLinkSet.
	* @param index The index of the item.
	* @returns The requested item. */
	removeChildByIndex(index) {
		this._children[(Object.keys(this._children)[index])] = undefined;
	}


	/** Removes all the NodeLink instances of the NodeLinkSet  */
	clear() { this._children = {}; }


	/** Deserializes a data item into the NodeLinkSet instance.
	 * @param data The instance data. */
	deserialize(data) {

		// Check the data 
		if (data == undefined)
			return;

		// Get the items of the node set
		if (Array.isArray(data)) {
			this._indexed = true;
			let index = 0;
			for (let value of data)
				this.addChild((index++).toString(), {
					reference: value, origin: this._origin
				}

				);
		}
		else if (typeof data == 'object') {
			this._indexed = false;
			for (let key in data) {
				if (typeof data[key] == "number")
					this.addChild(key, { reference: key, strength: data[key] });
				else
					this.addChild(key, data[key]);
			}
		}
		else
			throw Error('Invalid node set data');
	}


	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() {
		if (this._indexed == true) {
			// Create the array to store An object
			let array = [];

			// Serialize the nodes
			let children = Object.values(this._children);
			for (let child of children)
				array.push(child.serialize());

			// Return An object
			return (array.length > 0 ? array : undefined);
		}
		else {
			// Create the array to store An object
			let obj = {}, itemCount = 0;

			// Serialize the nodes
			for (let childName in this._children) {
				let item = this.children[childName].serialize();
				if (item != undefined) {
					obj[childName] = item;
					itemCount++;
				}
			}

			// Return An object
			return (Object.keys(obj).length > 0 ? obj : undefined);
		}
	}


	/** Iterates through the child nodes of the node. */
	[Symbol.iterator]() {
		let pointer = 0, nodes = Object.values(this._children);
		return {
			next() {
				if (pointer < nodes.length)
					return { done: false, value: nodes[pointer++] };
				else
					return { done: true, value: null };
			}
		};
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the NodeLinkSet class. */
NodeLinkSet.type = new NodeType('NodeLinkSet', 'links', Node.type, NodeLinkSet);


/** Facilitates the serialization and deserialization of a JSON data. */
export class JsonSerialization {

	/** Parse the JSON string into an Object
	 * @param jsonString The string with the a data item to deserialize.
	 * @param node The node to deserialize to.
	 * @returns A SerializationNode with the a data item. */
	static deserialize(jsonString, node) {

		// TEMPORAL
		// Remove the comments and trailing commas from the JSONC files
		jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
		jsonString = jsonString.replace(/\,\s*\n(\s*[}|\]])/gm, '\n$1');

		// Use the JSON library to parse the data
		let data = JSON.parse(jsonString);

		// If there is a node
		if (node)
			node.deserialize(data);

		// Return the data
		return data;
	}


	/** Creates a JSON representation of the data.
	 * @param data The data to serialize.
	 * @param options The serialization options
	 * @returns JSON representation of the data. */
	static serialize(data, options = {}) {

		// If not defined, set the best options for JSON serialization
		if (options.removeTyping == undefined)
			options.removeTyping = true;

		// If the data is a node instance, serialize it
		if (data.isNode)
			data = data.serialize(options);

		// Check if the data is undefined
		if (data == undefined)
			return '(Undefined)';

		// TEMPORAL
		let result = JSON.stringify(data, null, '\t');
		if (result.length < 80)
			result = result.replace(/\n\t*/g, ' ');
		return result;
		// return JsonSerialization.serializeNode(data, options);
	}


	/** Translates a data node to a JSON string.
	 * @param data The data item to serialize.
	 * @param options The serialization options.
	 * @returns The JSON string representing the data item. */
	static serializeNode(data, options = {}) {

		// Get the serialization parameters
		let name = options.name, tabLevel = options.tabLevel || 0, multiline = options.multiline || true, separator = (options.minify) ? options.separator : '', itemSeparator = options.itemSeparator || ',', tabString = options.tabString || '\t', tabSize = options.tabSize || 4, maxLineSize = options.maxLineSize || 80, lineSeparator = (options.minify) ? '\n' : '';


		// Create a copy of the params, with an increased tabulation level
		let itemParams = { ...options };
		itemParams.tabLevel = tabLevel + 1;

		// Start defining the structure of the node
		let node = { name: name, items: [],
			type: (Array.isArray(data) ? 'array' : typeof data),
			text: (name ? '"' + name + '":' + separator : ''),
			multiline: false, separator: itemSeparator
		};

		// If the value is null, return a null node
		if (data == null) {
			node.text = 'null';
			return node;
		}

		// Check the type of the value
		node.type = (Array.isArray(data)) ? 'array' : typeof data;
		switch (node.type) {
			case 'boolean':
				node.text += data ? 'true' : 'false';
				break;
			case 'bigint':
				node.text += data + 'n';
				break;
			case 'number':
				node.text += data;
				break;
			case 'string': // Strings require a bit of care
				node.text += '"' + data.replace(/\"/g, '\\"') + '"';
				break;
			case 'array': // Arrays
				node.start = '[', node.end = ']';
				node.separator = itemSeparator;
				for (let item of data)
					node.items.push(this.serializeNode(item, itemParams));
				break;
			case 'object':
				if (data.type == 'comment') {
					if (data.text.includes('\n')) {
						node.text = '';
						let lines = data.text.split('\n');
						for (let line of lines)
							node.items.push({ text: line, separator: '', tabLevel: tabLevel });
						node.items[0].text = '/* ' + node.items[0].text;
						node.items[0].tabLevel = 0;
						node.items[lines.length - 1].text += ' */';
					}
					else
						node.text = '// ' + data.text;
					node.separator = '';
					node.multiline = true;
					break;
				}
				node.start = '{', node.end = '}';
				node.separator = itemSeparator;
				for (let itemName in data)
					node.items.push(this.serializeNode(data[itemName], itemParams));
				break;
		}

		// If it is not a complex object, just return the node as it is
		if (node.items.length == 0)
			return node;

		// Check if the inner nodes are already in multiple lines
		let line = '', lineSize = 0, itemIndex, itemCount = node.items.length;
		for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
			if (node.items[itemIndex].multiline == true) {
				node.multiline = true;
				break;
			}
		}

		// If it is an array or an object, try to keep it in a single line
		if (node.multiline == false || multiline == false) {
			if (node.start)
				line = node.start + separator;
			for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
				let item = node.items[itemIndex];
				line += item.text + ((itemIndex < itemCount - 1) ?
					(item.separator + separator) : '');
			}
			if (node.end)
				line += separator + node.end;
			lineSize = tabLevel + tabSize + line.length;
			node.multiline = lineSize > maxLineSize;
		}

		// Check if the node must be made into multiple lines 
		if (multiline && node.multiline) {
			if (node.start)
				node.text += node.start + lineSeparator;
			for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
				let item = node.items[itemIndex];
				let tl = item.tabLevel != undefined ? item.tabLevel : (tabLevel + 1);
				node.text += tabString.repeat(tl) + item.text;
				if (itemIndex < itemCount - 1)
					node.text += item.separator + lineSeparator;
			}
			if (node.end)
				node.text += lineSeparator +
					tabString.repeat(tabLevel) + node.end;
			node.multiline = true;
		}
		// Otherwise, just add the created line
		else
			node.text += line;

		// Return the resulting node
		return node;
	}
}





/** Defines a simple data type. */
export class Simple extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Simple node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value.
	 * @param type The node type. */
	constructor(name, parent, data, def, type = Simple.type) {

		// Call the base class constructor
		super(name, parent, undefined, type);

		// Set the default value
		if (def != undefined)
			this._default = def;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The encapsulated value. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The encapsulated value. */ ;
	get value() {
		return (this._value != undefined) ? this._value : this._default;
	}
	set value(newValue) {
		if (this._value != newValue)
			this.updated = false;
		this._value = newValue;
	}

	/** The default value. */
	get default() { return this._default; }
	set default(newDefault) {
		if (typeof newDefault != 'string')
			newDefault = '' + newDefault;
		if (this._default != newDefault)
			this.updated = false;
		this._default = newDefault;
	}

	/** Indicates if the value is undefined. */
	get isUndefined() { return this._value == undefined; }
	;

	/** Indicates if the value is the default. */
	get isDefault() {
		return this._default != undefined && this._value == this._default;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) { this.value = data; }


	/** Serializes the instance to a data object.
	 * @param options The serialization options.
	 * @returns An object with the data of the instance. */
	serialize(options = {}) { return this.value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Simple class. */
Simple.type = new NodeType('Simple', 'simple', Node.type, Simple);





/** Defines a simple data type that stores a boolean value. */
export class Boolean extends Simple {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Boolean node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value. */
	constructor(name, parent, data, def) {

		// Call the base class constructor
		super(name, parent, undefined, def, Boolean.type);

		// Create the link
		this._link = new NodeLink('link', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The encapsulated boolean value. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The encapsulated boolean value. */ ;
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (typeof newValue != 'boolean') {
			switch (typeof newValue) {
				case 'number':
					newValue = newValue != 0;
					break;
				case 'string':
					newValue = (newValue == 'true');
					break;
				default: throw Error('Invalid data type for: ' + this.nodePath);
			}
		}
		if (this.value != newValue)
			this.updated = false;
		this._value = newValue;
	}

	/** The default value of the Boolean. */
	get default() { return this._default; }
	set default(newDefault) {
		if (this._default != newDefault)
			this.updated = false;
		this._default = newDefault;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) { this.value = data; }


	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() { return this.value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Boolean class. */
Boolean.type = new NodeType('Boolean', 'boolean', Simple.type, Boolean);





/** Defines a simple data type that stores a numeric value. */
export class Number extends Simple {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Number node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value.
	 * @param min The minimum value.
	 * @param max The maximum value. */
	constructor(name, parent, data, def, min, max) {

		// Call the base class constructor
		super(name, parent, undefined, def, Number.type);

		// Create the link
		this._link = new NodeLink('link', this);

		// Set the default value
		if (min != undefined)
			this._min = min;
		if (max != undefined)
			this._max = max;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The numeric value of the Number. */
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (typeof newValue != 'number') {
			switch (typeof newValue) {
				case 'string':
					newValue = parseFloat(newValue);
					break;
				case 'boolean':
					newValue = newValue ? 1 : 0;
					break;
				case 'object':
					newValue = newValue.value;
					break;
				case 'undefined':
					newValue = undefined;
					break;
				default: throw Error('Invalid data type for: "' + this.nodePath +
					'" ' + JSON.stringify(newValue));
			}
		}
		if (this._value != newValue)
			this.updated = false;
		if (this._min != undefined && newValue < this._min)
			throw Error('Invalid value "' + newValue + '" for ' +
				this.nodePath + ' (minimum value is: "' + this._min + '")');
		if (this._max != undefined && newValue > this._max)
			throw Error('Invalid value "' + newValue + '" for ' +
				this.nodePath + ' (maximum value is: "' + this._max + '")');
		this._value = newValue;
	}


	/** The default value of the Number. */
	get default() { return this._default; }
	set default(newDefault) {
		if (this._default != newDefault)
			this.updated = false;
		this._default = newDefault;
	}


	/** The minimum numeric value of the Number. */
	get min() { return this._min; }
	set min(newMin) {
		if (this._min != newMin)
			this.updated = false;
		if (this.min != undefined && newMin > this._max)
			throw Error('Invalid minimum value "' + newMin + '" for ' +
				this.nodePath + ' (maximum value is: "' + this._max + '")');
		this._min = newMin;
	}


	/** The maximum numeric value of the Number. */
	get max() { return this._max; }
	set max(newMax) {
		if (this._max != newMax)
			this.updated = false;
		if (this.max != undefined && newMax < this._min)
			throw Error('Invalid maximum value "' + newMax + '" for ' +
				this.nodePath + ' (minimum value is: "' + this._min + '")');
		this._max = newMax;
	}


	// --------------------------------------------------------- PUBLIC METHODS


	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'object':
				this._min = data.min;
				this._max = data.max;
				this._default = data.default;
				this.value = data.value;
				this._link.reference = data.link;
				break;
			case 'undefined':
				this.value = undefined;
				break;
			default: this.value = data;
		}
	}


	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() { return this.value; }


	/** Serializes a number to a string representation.
	 * @returns The string with the numeric value. */
	toString() { return Number.toString(this._value); }


	/** Serializes a number to a string representation.
	 * @param value The numeric value to serialize.
	 * @returns The string with the numeric value. */
	static toString(value) {
		if (value == undefined)
			return 'undefined';
		let string = value.toFixed(5), point = string.indexOf('.'), cursor = point + 1, l = string.length;
		while (cursor > 0 && cursor < l - 1) {
			if (string[cursor] == '0' && string[cursor + 1] == '0') {
				if (cursor == point + 1)
					cursor = point;
				string = string.slice(0, cursor);
				break;
			}
			cursor++;
		}
		return string;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Number class. */
Number.type = new NodeType('Number', 'number', Simple.type, Number);






/** Defines a simple data type that stores a textual value. */
export class String extends Simple {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the String node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value.
	 * @param def The default value. */
	constructor(name, parent, data, def, validValues) {

		// Call the base class constructor
		super(name, parent, undefined, def, String.type);

		// Initialize the list of valid values
		this._validValues = validValues || [];

		// Create the link
		this._link = new NodeLink('link', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The encapsulated textual value. */ ;

	/** The valid values of the String. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The encapsulated textual value. */ ;
	get value() {
		return (this._value != undefined) ? this._value : this._default;
	}
	set value(newValue) {
		if (newValue != undefined) {
			let values = this._validValues;
			if (values.length > 0 && !values.includes(newValue))
				throw Error('Invalid value: "' + newValue + '" for: "' +
					this.nodePath + '". Valid values are: ' + values.join(', '));
			else if (typeof newValue != 'string')
				newValue = '' + newValue;
		}
		if (this._value != newValue)
			this.updated = false;
		this._value = newValue;
	}

	/** The default value of the String. */
	get default() { return this._default; }
	set default(newDefault) {
		if (typeof newDefault != 'string')
			newDefault = '' + newDefault;
		if (this._default != newDefault)
			this.updated = false;
		this._default = newDefault;
	}

	/** The valid values of the String. */ ;
	get validValues() { return this._validValues; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Sting instance.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {
		if (this._link.reference) {
			if (!this._link.updated)
				this._link.update();

			// console.log("Updated: " + this.nodePath);
			this.value = this._link.node._value;
		}
		super.update();
	}

	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'object':
				this._default = data.default;
				this.value = data.value;
				this._validValues = data.validValues || [];
				this._link.reference = data.link;
				break;
			case 'undefined':
				this.value = undefined;
				break;
			default: this.value = '' + data;
		}
	}


	/** Serializes the instance to a data object.
	 * @param options The serialization options.
	 * @returns An object with the data of the instance. */
	serialize(options = {}) {
		// return this._value; 
		let data = {};
		if (this._value != undefined)
			data.value = this._value;
		if (this._link.reference != undefined)
			data.link = this._link.reference;
		if (options.optimize && !data.value && !data.link)
			return;
		return data;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the String class. */
String.type = new NodeType('String', 'string', Simple.type, String);





/** Defines a generic three-dimensional vector. */
export class Vector extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Vector node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default values of the vector. */
	constructor(name, parent, data, def) {

		// Call the base class constructor
		super(name, parent, undefined, Vector.type);

		// Set the default values
		let d = { x: 0, y: 0, z: 0 };
		if (def) {
			if (Array.isArray(def)) {
				for (let i = 0; i < 3; i++)
					if (def.length > i)
						d.x = def[i];
			}
			else if (typeof def == 'object') {
				d = { x: def.x || 0, y: def.y || 0, z: def.z || 0 };
			}
			else if (typeof def == 'number')
				d = { x: def, y: def, z: def };
			else
				throw Error('Invalid definition value for:' + this.nodePath);
		}

		// Initialize the child nodes
		this._x = new Number('x', this, undefined, d.x);
		this._y = new Number('y', this, undefined, d.y);
		this._z = new Number('z', this, undefined, d.z);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The numerical value in the X axis. */ ;

	/** The numerical value in the Y axis. */ ;

	/** The numerical value in the Y axis. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The numerical value in the X axis. */ ;
	get x() { return this._x; }

	/** The numerical value in the Y axis. */ ;
	get y() { return this._y; }

	/** The numerical value in the Z axis. */ ;
	get z() { return this._z; }

	/** Indicates if the Vector is undefined. */
	get isUndefined() {
		return this._x.isUndefined && this._y.isUndefined && this._z.isUndefined;
	}

	/** Indicates if the Vector has the default value. */
	get isDefault() {
		return this._x.isDefault && this._y.isDefault && this._z.isDefault;
	}

	/** Calculates the length of the vector. */
	get length() {
		let x = this._x.value, y = this._y.value, z = this._z.value;
		return Math.sqrt(x * x + y * y + z * z);
	}

	/** The values of the Vector. */
	get values() {
		return { x: this._x.value, y: this._y.value, z: this._z.value };
	}
	set values(values) {
		if (values.x != undefined)
			this._x.value = values.x;
		if (values.y != undefined)
			this._y.value = values.y;
		if (values.z != undefined)
			this._z.value = values.z;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) {
		if (Array.isArray(data)) {
			if (data.length > 0)
				this.x.value = data[0];
			if (data.length > 1)
				this.y.value = data[1];
			if (data.length > 2)
				this.z.value = data[2];
		}
		else if (typeof data == 'object') {
			if (data.x != undefined)
				this.x.value = data.x;
			if (data.y != undefined)
				this.y.value = data.y;
			if (data.z != undefined)
				this.z.value = data.z;
		}
		else if (typeof data == 'boolean') {
			this.x.value = this.y.value = this.z.value = (data == true) ? 1 : 0;
		}
		else if (typeof data == 'number') {
			this.x.value = this.y.value = this.z.value = data;
		}
		else if (typeof data == 'string') {
			this.x.value = this.y.value = this.z.value = parseFloat(data);
		}
		else
			throw Error('Invalid value: "' + data.toString() +
				'" for:' + this.nodePath);
	}


	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() {
		if (!this._x.isDefault || !this._y.isDefault || !this._z.isDefault)
			return [this._x.value, this._y.value, this._z.value];
	}

	/** Copies the values of another Vector instance.
	 * @param vector The instance to copy from. */
	clone(parent) {
		return new Vector(this._name, parent, this.values);
	}


	/** Copies the values of another Vector instance.
	 * @param vector The instance to copy from. */
	copy(vector) {
		this._x.value = vector._x.value;
		this._y.value = vector._y.value;
		this._z.value = vector._z.value;
	}

	/** Sets the values of the Vector.
	 * @param x The value to add in the X axis.
	 * @param y The value to add in the Y axis.
	 * @param z The value to add in the Z axis. */
	set(x = 0, y = 0, z = 0) {
		if (x != undefined)
			this._x.value = x;
		if (y != undefined)
			this._y.value = y;
		if (z != undefined)
			this._z.value = z;
	}




	/** Adds numeric values to the vector.
	 * @param x The value to add in the X axis.
	 * @param y The value to add in the Y axis.
	 * @param z The value to add in the Z axis. */
	addValues(x = 0, y = 0, z = 0) {
		if (x != undefined)
			this._x.value += x;
		if (y != undefined)
			this._y.value += y;
		if (z != undefined)
			this._z.value += z;
	}


	/** Subtracts numeric values to the vector.
	 * @param x The value to subtract in the X axis.
	 * @param y The value to subtract in the Y axis.
	 * @param z The value to subtract in the Z axis. */
	subtractValues(x = 0, y = 0, z = 0) {
		if (x != undefined)
			this._x.value += x;
		if (y != undefined)
			this._y.value += y;
		if (z != undefined)
			this._z.value += z;
	}


	/** Normalizes the vector (set its length to 1). */
	normalize() {
		let x = this._x.value, y = this._y.value, z = this._z.value, l = Math.sqrt(x * x + y * y + z * z);
		if (x)
			this._x.value /= l;
		if (y)
			this._y.value /= l;
		if (z)
			this._z.value /= l;
	}


	/** Calculates the distance between two Vector Instances.
	 * @param v1 The first Vector instance.
	 * @param v2 The second Vector instance.
	 * @returns The distance between two Vector Instances. */
	static distance(v1, v2) {
		let dx = v2._x.value - v1._x.value, dy = v2._y.value - v1._y.value, dz = v2._z.value - v1._z.value;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}


	/** Checks if the vector equals another Vector instance.
	* @param v The vector instance to check;
	* @returns A boolean value indicating if the vectors are equal. */
	equals(v) {
		return this._x.value == v._x.value &&
			this._y.value == v._y.value &&
			this._z.value == v._z.value;
	}

	/** Checks if two Vector instances are equal.
	 * @param v1 The first Vector instance.
	 * @param v2 The second Vector instance.
	 * @param t The interpolation value (between 0 and 1)
	 * @returns  A boolean value indicating if the vectors are equal. */
	static equals(v1, v2) {
		return v1._x.value == v2._x.value &&
			v1._y.value == v2._y.value && v1._z.value == v2._z.value;
	}


	/** Interpolates between two Vector Instances.
	 * @param v1 The first Vector instance.
	 * @param v2 The second Vector instance.
	 * @param t The interpolation value (between 0 and 1)
	 * @returns The interpolated Color instance. */
	static interpolate(v1, v2, t) {
		return new Vector('vector', undefined, [
			v1._x.value + (v2._x.value - v1._x.value) * t,
			v1._y.value + (v2._y.value - v1._y.value) * t,
			v1._z.value + (v2._z.value - v1._z.value) * t,
		]);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Vector class. */
Vector.type = new NodeType('Vector', 'vector', Node.type, Vector);









/** Defines an RGBA Color. */
export class Color extends Node {

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Vector node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Color.type);

		// Initialize the child nodes
		this._r = new Number('r', this, undefined, 0, 0, 1);
		this._g = new Number('g', this, undefined, 0, 0, 1);
		this._b = new Number('b', this, undefined, 0, 0, 1);
		this._a = new Number('a', this, undefined, 1, 0, 1);
		this._text = new String('text', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The Red component of the color. */ ;

	/** The Green component of the color. */ ;

	/** The Blue component of the color. */ ;

	/** The Alpha component of the color. */ ;

	/** The text representation of the color. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The Red component of the color. */ ;
	get r() { return this._r; }

	/** The numerical value in the Y axis. */ ;
	get g() { return this._g; }

	/** The numerical value in the Z axis. */ ;
	get b() { return this._b; }

	/** The numerical value in the Z axis. */ ;
	get a() { return this._a; }

	/** The text representation of the color. */ ;
	get text() { return this._text; }

	/** Indicates if the value is the default. */
	get isDefault() {
		return this.r.isDefault && this.g.isDefault && this.b.isDefault &&
			this.a.isDefault && this._text.isDefault;
	}

	/** Indicates if the value is the undefined. */
	get isUndefined() {
		return this.r.isUndefined && this.g.isUndefined && this.b.isUndefined &&
			this.a.isUndefined && this._text.isUndefined;
	}

	/** The hexadecimal value of the color. */
	get hex() {
		let r = Math.floor(this._r.value * 255).toString(16).padStart(2, '0'), g = Math.floor(this._g.value * 255).toString(16).padStart(2, '0'), b = Math.floor(this._b.value * 255).toString(16).padStart(2, '0'), a = (this._a.value == 1) ? '' :
			Math.floor(this._a.value * 255).toString(16).padStart(2, '0');
		return '#' + r + g + b; //+ a;
	}
	set hex(v) {
		try {
			this._text.value = undefined;
			if (v[0] == '#')
				v = v.slice(1);
			let charCount = v.length, short = charCount < 5;
			if (charCount < 3)
				throw Error("Wrong value");
			let r = parseInt(short ? v[0] + v[0] : v[0] + v[1], 16);
			this._r.value = (r > 0) ? r / 255 : 0;
			let g = parseInt(short ? v[1] + v[1] : v[2] + v[3], 16);
			this._g.value = (g > 0) ? g / 255 : 0;
			let b = parseInt(short ? v[2] + v[2] : v[4] + v[5], 16);
			this._b.value = (b > 0) ? b / 255 : 0;
			if (!(charCount == 4 || charCount == 8))
				return;
			let a = parseInt(short ? v[3] + v[3] : v[6] + v[7], 16);
			this._a.value = (a > 0) ? a / 255 : 0;
		}
		catch (e) {
			throw Error('Invalid Hex value "' + v + '" for ' + this.nodePath);
		}
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes a data item into the instance.
	 * @param data The initialization data. */
	deserialize(data) {
		if (Array.isArray(data)) {
			if (data.length > 0)
				this._r.value = data[0];
			if (data.length > 1)
				this._g.value = data[1];
			if (data.length > 2)
				this._b.value = data[2];
			if (data.length > 3)
				this._a.value = data[3];
		}
		else {
			let dataType = typeof data;
			if (typeof data == 'object') {
				if (data.r != undefined)
					this._r.value = data.r;
				if (data.g != undefined)
					this._g.value = data.g;
				if (data.b != undefined)
					this._b.value = data.b;
				if (data.a != undefined)
					this._a.value = data.a;
			}
			else if (dataType == 'number') {
				this._r.value = this._g.value = this._b.value = data;
			}
			else if (dataType == 'string') {
				if (data.startsWith('#'))
					this.hex = data;
				else
					this._text.value = data;
			}
			else
				throw Error('Invalid value: "' + data.toString() + '" ' +
					'of type"' + dataType + '" for: ' + this.nodePath);
		}
	}


	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() {
		if (this.text.value)
			return this.text.value;
		let v = [this._r.value, this._g.value, this._b.value, this._a.value];
		if (v[0] == 0 && v[1] == 0 && v[2] == 0 && v[3] == 1)
			return undefined;
		if (v[3] == 1)
			v.pop();
		return v;
	}


	/** Copies the values of another Color instance.
	 * @param color The Color instance to copy from. */
	copy(color) {
		this._r.value = color._r.value;
		this._g.value = color._g.value;
		this._b.value = color._b.value;
		this._a.value = color._a.value;
		this._text.value = color._text.value;
	}


	/** Serializes the instance to a string representation.
	 * @returns The string representation with the data of the instance. */
	toString() {
		return this._text.value ? this._text.value : this.hex;
	}


	/** Interpolates between two Color Instances.
	 * @param c1 The first Color instance.
	 * @param c2 The second Color instance.
	 * @param t The interpolation value (between 0 and 1)
	 * @returns The interpolated Color instance. */
	static interpolate(c1, c2, t) {
		return new Color('color', undefined, [
			c1._r.value + (c2._r.value - c1._r.value) * t,
			c1._g.value + (c2._g.value - c1._g.value) * t,
			c1._b.value + (c2._b.value - c1._b.value) * t,
		]);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Color class. */
Color.type = new NodeType('Color', 'color', Node.type, Color);






/** Defines a tridimensional bounding box. */
export class BoundingBox extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new BoundingBox instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, null, BoundingBox.type);

		// Initialize the child nodes
		this._min = new Vector('min', this, null, Number.NEGATIVE_INFINITY);
		this._max = new Vector('max', this, null, Number.POSITIVE_INFINITY);
		this._center = new Vector('center', this);
		this._size = new Vector('size', this, null, Number.POSITIVE_INFINITY);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The minimum Vector of the BoundingBox. */
	get min() { return this._min; }

	/** The X value of the minimum point of the BoundingBox. */
	get minX() { return this._min.x.value; }

	/** The Y value of the minimum point of the BoundingBox. */
	get minY() { return this._min.y.value; }

	/** The Z value of the minimum point of the BoundingBox. */
	get minZ() { if (!this.updated)
		return this._min.z.value; }


	/** The maximum Vector of the BoundingBox. */
	get max() { return this._max; }

	/** The X value of the maximum point of the BoundingBox. */
	get maxX() { return this._max.x.value; }

	/** The Y value of the maximum point of the BoundingBox. */
	get maxY() { return this._max.y.value; }

	/** The Z value of the maximum point of the BoundingBox. */
	get maxZ() { return this._max.z.value; }


	/** The center Vector of the BoundingBox. */
	get center() { return this._center; }

	/** The X value of the center Vector of the BoundingBox. */
	get x() { return this._center.x.value; }

	/** The Y value of the center Vector of the BoundingBox. */
	get y() { return this._center.y.value; }

	/** The Z value of the center Vector of the BoundingBox. */
	get z() { return this._center.z.value; }


	/** The width of the BoundingBox. */
	get width() { return this._size.x.value; }

	/** The height of the BoundingBox. */
	get height() { return this._size.y.value; }

	/** The depth of the BoundingBox. */
	get depth() { return this._size.z.value; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Serializes the instance to a data object.
	 * @returns An object with the data of the instance. */
	serialize() { return undefined; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Rectangle class. */
BoundingBox.type = new NodeType('BoundingBox', 'bb', Node.type, BoundingBox);








/** Defines an item of the data model. */
export class Item extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Item node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data, type = Item.type) {

		// Call the base class constructor
		super(name, parent, undefined, type);

		// Initialize the child nodes
		this._title = new String('title', this);
		this._description = new String('description', this);
		this._forms = new NodeSet('forms', this, Form.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the data model Item. */ ;

	/** The description of the data model Item. */ ;

	/** The forms of the data model Item. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the data model Item. */
	get title() { return this._title; }

	/** The description of the data model Item. */
	get description() { return this._description; }

	/** The forms of the data model Item. */ ;
	get forms() { return this._forms; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Component class. */
Item.type = new NodeType('Item', 'item', Node.type, Item);










/** Defines the visual representation of an element of a Knowledge Graph */
export class Form extends Node {



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Form node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Form.type);

		// Initialize the child nodes
		this._title = new String('title', this);
		this._description = new String('description', this);
		// this._shape = {};
		this._points = new NodeSet('points', this, Vector.type);
		this._color = new Color('color', this);
		this._offset = new Number('offset', this);
		this._position = new Vector('position', this);
		this._values = new NodeSet('values', this, Number.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the Form. */ ;

	/** The description of the Form. */ ;

	/** The shape of the Form. */ ;
	// protected _shape: object;

	/** The points of the Form. */ ;

	/** The color of the Form. */ ;

	/** The offset of the Form. */ ;

	/** The position of the Form. */ ;

	/** The extra values of the Form. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES


	/** The title of the Form. */
	get title() { return this._title; }

	/** The description of the Form. */
	get description() { return this._description; }

	/** The shape of the Form. */ ;
	// get shape(): object { return this._shape; }

	/** The points of the Form. */
	get points() { return this._points; }

	/** The color of the Form. */
	get color() { return this._color; }

	/** The offset of the Form. */
	get offset() { return this._offset; }

	/** The position of the Form. */
	get position() { return this._position; }

	/** The extra values of the Form. */
	get values() { return this._values; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Form class. */
Form.type = new NodeType('Form', 'form', Node.type, Form);










/** Defines the Root Node of the data model. */
export class Model extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Model instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Model.type);

		// Initialize the child nodes
		this._domains = new NodeSet('domains', this, Domain.type);
		this._classes = new NodeSet('classes', this, Class.type);
		this._relations = new NodeSet('relations', this, Relation.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The list of domains of the Model. */
	get domains() { return this._domains; }

	/** The list of classes of the Model. */
	get classes() { return this._classes; }

	/** The list of relations of the Model. */
	get relations() { return this._relations; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Root class. */
Model.type = new NodeType('Model', 'model', Node.type, Model);







/** Defines a Domain of a data model. */
export class Domain extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Domain node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Domain.type);

		// Initialize the child nodes
		this._extends = new NodeLink('extends', this);
		this._classes = new NodeLinkSet('classes', this, Class.type, undefined, '../../../classes/');

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent Domain of the Domain. */
	get extends() { return this._extends; }

	/** The classes of the Domain. */
	get classes() { return this._classes; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Domain class. */
Domain.type = new NodeType('Domain', 'domain', Item.type, Domain);















/** Defines a Class of a data model. */
export class Class extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Class node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Class.type);

		// Initialize the child nodes
		this._abstract = new Boolean('abstract', this);
		this._domains = new NodeLinkSet('domains', this, Domain.type, undefined, '../../../domains/');
		this._relations = new NodeLinkSet('relations', this, Relation.type, undefined, '../../../relations/');
		this._extends = new NodeLink('extends', this);
		this._properties = new NodeSet('properties', this, Property.type);
		this._instances = new NodeSet('instances', this, ClassInstance.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The domain of the Class. */
	get abstract() { return this._abstract; }

	/** The domain names of the Class. */
	get domains() { return this._domains; }

	/** The relation names of the Class. */
	get relations() { return this._relations; }

	/** The parent class of the Class. */
	get extends() { return this._extends; }

	/** The properties of the Class. */
	get properties() { return this._properties; }

	/** The instances of the Class. */
	get instances() { return this._instances; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Class class. */
Class.type = new NodeType('Class', 'class', Node.type, Class);




/** Defines a Property of a Class of a data model. */
export class Property extends Item {


	// ---------------------------------------------------------- PUBLIC FIELDS

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Property node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Property.type);

		// Initialize the child nodes

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Property class. */
Property.type = new NodeType('Property', 'property', Item.type, Property);









/** Defines a Class Instance of a data model. */
export class ClassInstance extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the ClassInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, ClassInstance.type);

		// Initialize the child nodes
		this._class = new NodeLink('class', this);
		this._properties = new NodeSet('properties', this, Property.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The link to the Class of the ClassInstance. */
	get class() { return this._class; }

	/** The properties of the ClassInstance. */
	get properties() { return this._properties; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the ClassInstance class. */
ClassInstance.type = new NodeType('ClassInstance', 'class_instance', Node.type, ClassInstance);










/** Defines a Relation of a data model.  */
export class Relation extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Relation node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Relation.type);

		// Initialize the child nodes
		this._extends = new NodeLink('extends', this);
		this._instances = new NodeSet('instances', this, RelationInstance.type);
		this._classes = new NodeLinkSet('classes', this, Class.type, undefined, '../../../classes/');

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent class of the Relation. */
	get extends() { return this._extends; }

	/** The instances of the Relation. */
	get instances() { return this._instances; }

	/** The list of classes with the Relation. */
	get classes() { return this._classes; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Relation class. */
Relation.type = new NodeType('Relation', 'relation', Item.type, Relation);







/** Defines a Relation Instance of a data model. */
export class RelationInstance extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the RelationInstance node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, RelationInstance.type);

		// Initialize the child nodes
		this._relation = new NodeLink('relation', this);
		this._origin = new NodeLink('origin', this);
		this._target = new NodeLink('target', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The link to the Relation of the RelationInstance. */
	get relation() { return this._relation; }

	/** The origin of the RelationInstance. */
	get origin() { return this._origin; }

	/** The target of the RelationInstance. */
	get target() { return this._target; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the RelationInstance class. */
RelationInstance.type = new NodeType('RelationInstance', 'relation_instance', Item.type, RelationInstance);




/** Creates a visual component (that can be directly be serialized to SVG). */
export class Component {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Component instance.
	 * @param tag The SVG tag of the Component.
	 * @param name The name of the Component.
	 * @param parent parent Component instance.
	 * @param attributes The SVG attributes of the Component.
	 * @param content The SVG content of the Component.
	 * @param unique Whether to ensure the Component is unique or not. */
	constructor(tag, name, parent, attributes, content, unique = false) {

		// Set the tag, attributes and content of the component
		if (tag)
			this._tag = tag;
		else
			throw Error('Invalid SVG tag');

		// Save the name name
		if (name)
			this._name = name;

		// If possible, create the SVG element with the "document" instance
		if (SHISHOU.environment == 'browser') {
			if (name && unique)
				this._element =
					document.getElementById(name);
			if (!this._element) {
				this._element = document.createElementNS('http://www.w3.org/2000/svg', tag);
				if (name)
					this._element.setAttribute('id', name);
				let parentElement = parent ? parent._element : document.body;
				parentElement.appendChild(this._element);
			}
		}

		// Set the attributes
		this._attributes = {};
		let a = attributes;
		if (attributes != undefined && typeof attributes == 'object')
			for (let key in attributes)
				this.set(key, attributes[key]);

		// Create the list of animations
		this._animations = {};

		// Set the content
		if (content)
			this.content = content;
		else
			this._content = '';

		// Set the parent-child relationship
		this._children = [];
		if (parent != undefined)
			parent.addChild(this);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The tag of the Component. */
	get tag() { return this._tag; }

	/** The name of the Component. */
	get name() { return this._name; }

	/** The width of the Component. */
	get width() { return this._width; }
	set width(w) { this._width = w; }

	/** The height of the Component. */
	get height() { return this._height; }
	set height(h) { this._height = h; }

	/** The content of the Component. */
	get content() { return this._content; }
	set content(c) {
		this._content = c;
		if (this._element)
			this._element.innerHTML = c;
	}

	/** The encapsulated SVG element. */
	get element() { return this._element; }

	/** The parent Component instance. */
	get parent() { return this._parent; }

	/** The child Component instances. */
	get children() { return this._children; }

	/** The animations of the Component. */
	get animations() { return this._animations; }

	/** Gets the root of the Component hierarchy
	 * (useful to avoid issues with multiple viewports). */
	get rootName() {
		return this._parent ? this._parent.rootName : this.name;
	}


	// --------------------------------------------------------- PUBLIC METHODS


	/** Adds a child Component.
	 * @param child The child Component to add. */
	addChild(child) {
		this.children.push(child);
		child._parent = this;
		this.element.appendChild(child.element);
	}


	/** Gets a child Component by its name.
	 * @param name The name of the child Component.
	 * @returns The Component with the given name. */
	getChild(name) {
		for (let child of this._children)
			if (child.name == name)
				return child;
	}


	/** Gets the value of an attribute.
	 * @param name The name of the attribute.
	 * @returns The value of the attribute. */
	get(name) { return this._attributes[name]; }


	/** Sets the value of an attribute.
	 * @param name The name of the attribute.
	 * @param value The new value of the attribute. */
	set(name, value) {
		if (typeof value == 'number')
			value = Number.toString(value);
		if (name.indexOf('_') >= 0)
			name = name.replace(/_/g, '-');
		this._attributes[name] = value;
		if (this._element)
			this._element.setAttribute(name, value);
	}


	/** Brings the component to the front. */
	bringToFront() {
		if (this._element && this._element.parentNode) {
			if (!this._element.nextElementSibling)
				return;
			let parent = this._element.parentNode;
			parent.removeChild(this._element);
			parent.appendChild(this._element);
		}
	}


	/** Serializes the Component to its SVG representation.
	 * @param tabLevel The tabulation level.
	 * @returns The SVG representation of the Component (as lines). */
	toString(tabLevel = 0) {

		// Create the start tag
		let tabs = '\t'.repeat(tabLevel), result = tabs + '<' + this.tag;

		// Save the id
		if (this._name)
			result += ' id="' + this._name + '"';

		// Add the attributes to the start tag
		for (let key in this._attributes)
			result += ' ' + key + '="' + this._attributes[key] + '"';

		// If there is any content, add it and return the result
		if (this._content)
			return result + '>' + this._content + '</' + this.tag + '>';

		// If there are no children, close the start tag and return the result
		if (this._children.length == 0 && tabLevel > 2)
			return result + '/>';

		// Create the list of children and finish with an end tag
		result += '>';
		for (let child of this._children)
			result += '\n' + child.toString(tabLevel + 1);
		return result + '\n' + tabs + '</' + this.tag + '>';
	}
}

// --------------------------------------------------------------- METADATA

/** The different valid values of the anchor. */
Component.anchor = ['none', 'top-left', 'top', 'top-right', 'left',
	'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];











/** Defines a basic interaction Element. */
export class Element extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Element instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of Element.
	 * @param type The main component of the Element.*/
	constructor(name, parent, data, type = Element.type, component) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Initialize the child nodes
		this._position = new Vector('position', this);
		this._width = new Number('width', this, undefined, undefined, 0);
		this._height = new Number('height', this, undefined, undefined, 0);
		this._anchor = new String('anchor', this, undefined, 'none', Element.anchorValues);
		this._offset = new Vector('offset', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// Store the main component of the element
		if (component == undefined)
			component = new Component('g');
		else if (typeof component == 'string')
			component = new Component(component);
		this._component = component;

		this._component.set('name', this._name);

		// Check if there is a parent Element to link to
		let parentElement = this.ancestor(Element.type);
		if (parentElement)
			parentElement.component.addChild(this._component);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The main Component of the Element. */
	get component() { return this._component; }

	/** The position of the Element. */
	get position() { return this._position; }

	/** The width of the Element. */
	get width() { return this._width; }

	/** The height of the Element. */
	get height() { return this._height; }

	/** The anchor of the Element. */
	get anchor() { return this._anchor; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Element.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		if (Node.modified(this.position, this._width, this._height, this._offset)) {
			let x = this._position.x.value, y = this._position.y.value, ox = this._offset.x.value, oy = this._offset.y.value, w = this._width.value, h = this._height.value;

			if (this._debugComponent) {
				this._debugComponent.set('width', w);
				this._debugComponent.set('height', h);
			}
			if (x + ox != 0 || y + oy != 0)
				this._component.set('transform', 'translate(' +
					Number.toString(x + ox) + ', ' + Number.toString(y + oy) + ')');
		}

		// Call the parent class method
		super.update(time, forced);
	}


	/** Deserializes a data item into the instance.
	 * @param data The DataNode with the data to deserialize. */
	deserialize(data) {

		// Create a debug component 
		if (data && data.debug && !this._debugComponent)
			this._debugComponent = new Component('rect', null, this._component.parent, { fill: 'none', stroke: 'green', 'stroke-width': 2 });

		// Call the parent class method
		super.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Element class. */
Element.type = new NodeType('Element', 'element', Node.type, Element);


// ---------------------------------------------------------- STATIC FIELDS

/** The different valid values of the anchor. */
Element.anchorValues = ['none', 'top-left', 'top', 'top-right', 'left',
	'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];






/** Defines a segment of a path. */
export class Segment extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Segment instance.
	 * @param name The name of the instance.
	 * @param parent The parent Path of the Segment.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data, type = Segment.type) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Check the type of the parent node 
		if (parent) {
			this._parentPath = parent.ancestor(Path.type);
			if (!this._parentPath)
				throw Error('Invalid parent for Segment node:' + this.nodePath);
		}

		// Initialize the child nodes
		this._start = new Vector('start', this);
		this._end = new Vector('end', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		if (this._start.isUndefined && this._parentPath)
			this.start.copy(this._parentPath.end);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent Path of the Segment. */
	get parentPath() { return this._parentPath; }

	/** The start point of the Segment. */
	get start() { return this._start; }

	/** The end point of the Segment. */
	get end() { return this._end; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Segment class. */
Segment.type = new NodeType('Segment', 'segment', Node.type, Segment);





/** Defines a Line Segment of a path. */
export class Line extends Segment {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Line instance.
	 * @param name The name of the instance.
	 * @param parent The parent Path of the Segment.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, Line.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Line class. */
Line.type = new NodeType('Line', 'line', Segment.type, Line);






/** Defines a Arc Segment of a path. */
export class Arc extends Segment {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Arc instance.
	 * @param name The name of the instance.
	 * @param parent The parent Path of the Segment.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, Arc.type);

		// Initialize the child nodes
		this._radius = new Number('radius', this, undefined, 100, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}

	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The radius of the Arc. */
	get radius() { return this._radius; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Arc class. */
Arc.type = new NodeType('Arc', 'arc', Segment.type, Arc);








/** Defines a path. */
export class Path extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Path instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, Path.type);

		// Initialize the child nodes
		this._segments = new NodeSet('segments', this, Segment.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The segments points of the Path. */
	get segments() { return this._segments; }


	/** The first point of the segment. */
	get start() {
		let segments = this._segments.count;
		if (segments == 0)
			throw Error('No segments in: ' + this.nodePath);
		return this._segments.getByIndex(0).start;
	}


	/** The last point of the segment. */
	get end() {
		let segments = this._segments.count;
		if (segments == 0)
			throw Error('No segments in: ' + this.nodePath);
		return this._segments.getByIndex(segments - 1).end;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Path.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		// Call the parent class method
		super.update(time, forced);
	}


	/** Generates the SVG representation of the Path.
	 * @param offset The offset of the path.
	 * @returns A string with the the SVG representation of the Path. */
	toSvg(offset = 0) {

		//
		if (this.segments.count == 0)
			return '';

		// The first segment os always the move value
		let segments = [], start = this.segments.first.start;

		// Copy the segment data
		let lastPoint;
		for (let segmentNode of this.segments) {

			let node = segmentNode, a = { x: node.start.x.value, y: node.start.y.value }, b = { x: node.end.x.value, y: node.end.y.value };
			if (!lastPoint || lastPoint.x != a.x || lastPoint.y != a.y)
				segments.push({ type: 'M', vertex: { x: a.x, y: a.y } });
			lastPoint = b;

			switch (node.type.name) {
				case 'Line':
					segments.push({ type: 'L', vertex: { x: b.x, y: b.y } });
					break;
				case 'Arc':
					segments.push({ type: 'A', vertex: { x: b.x, y: b.y },
						radius: node.radius.value });
					break;
			}
		}

		// Calculate the offset
		if (offset) {
			let segIndex = 0, segCount = segments.length;
			for (segIndex = 0; segIndex < segCount; segIndex++) {
				let normal = { x: 0, y: 0 }, c = segments[segIndex].vertex;
				if (segIndex > 0) {
					let p = segments[segIndex - 1].vertex;
					let x = c.y - p.y, y = c.x - p.x, l = Math.sqrt(x * x + y * y);
					normal.x -= x / l;
					normal.y += y / l;
				}
				if (segIndex < segCount - 1) {
					let n = segments[segIndex + 1].vertex;
					let x = n.y - c.y, y = n.x - c.x, l = Math.sqrt(x * x + y * y);
					normal.x -= x / l;
					normal.y += y / l;
				}
				;
				segments[segIndex].normal = normal;
			}

			// Update the vertex points with the normals
			for (segIndex = 0; segIndex < segCount; segIndex++) {
				let normal = segments[segIndex].normal;
				segments[segIndex].vertex.x += normal.x * offset;
				segments[segIndex].vertex.y += normal.y * offset;
			}
		}

		// Create some utility functions to format numbers to strings
		function n(n = 0) {
			if (n < Path._epsilon && n > -Path._epsilon)
				n = 0;
			return n.toLocaleString(undefined, { minimumFractionDigits: 0,
				maximumFractionDigits: 5, }).replace(/,/g, '');
		}
		function v(v) { return n(v.x) + ' ' + n(v.y) + ' '; }

		// Create the SVG data
		let svgData = '';
		for (let segment of segments) {
			switch (segment.type) {
				case 'M':
					svgData += 'M ' + v(segment.vertex);
					break;
				case 'L':
					svgData += 'L ' + v(segment.vertex);
					break;
				case 'A':
					svgData += 'A ' + segment.radius + ' ' +
						segment.radius + ' 0 0 1 ' + v(segment.vertex);
					break;
			}
		}
		// svgData += 'Z';

		return svgData;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Path class. */
Path.type = new NodeType('Path', 'path', Node.type, Path);

/** The epsilon value of the Path. */
Path._epsilon = 0.00001;

// /** Obtains the SVG representation of the Arc.
//  * @returns The SVG representation of the Arc. */
// toSvg(): string { 
// 	return 'A ' + this._radius.toString() + ' ' + this._radius.toString() +
// 		' 0 0 1 '+ this._end.x.toString() + ' ' + this._end.y.toString();
// }













/** Defines a bi-dimensional shape. */
export class Shape extends Element {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Shape instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of
	 * @param fillComponentTag The tag of fill component.*/
	constructor(name, parent, data, type = Shape.type, fillComponentTag = 'path') {

		// Call the parent class constructor
		super(name, parent, undefined, type, 'g');

		// Initialize the child nodes
		this._color = new Color('color', this, 'url(#Foreground)');
		this._paths = new NodeSet('paths', this, Path.type);
		this._strokes = new NodeSet('strokes', this, Stroke.type);
		this._shapes = new NodeSet('shapes', this, Shape.type);

		this._path = new Component(fillComponentTag, null, this._component);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The color of the Shape. */
	get color() { return this._color; }

	/** The path of the Shape. */
	get paths() { return this._paths; }

	/** The fill of the Shape. */
	get fill() { return this._path; }

	/** The strokes of the Shape. */
	get strokes() { return this._strokes; }

	/** The child shapes of the Shape. */
	get shapes() { return this._shapes; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Shape.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._color.updated) {
			let colorData = this._color.toString();
			if (colorData.startsWith('url(#'))
				colorData = 'url(#' +
					this.component.rootName + 'Color' + colorData.slice(5);
			this._path.set('fill', colorData);
		}

		// Create the SVG shape
		if (!this.paths.updated)
			this._path.set('d', this.toSVG());

		// Update the transform of the element to place the object
		let x = this._position.x.value, y = this._position.y.value;
		if (x != 0 && y != 0)
			this._component.set('transform', 'translate(' + x + ' ' + y + ')');

		// Call the parent class method
		super.update();
	}


	/** Generates the SVG representation of the Shape.
	 * @param offset The offset of the paths of the Shape.
	 * @returns A string with the the SVG representation of the Shape. */
	toSVG(offset = 0) {
		let svgData = '';
		for (let path of this._paths)
			svgData += path.toSvg(offset) + ' ';
		return svgData;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Shape class. */
Shape.type = new NodeType('Shape', 'shape', Node.type, Shape);









/** Defines a stroke shape. */
export class Stroke extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Stroke instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of node.*/
	constructor(name, parent, data, type = Stroke.type) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Check the type of the parent node 
		if (parent) {
			this._shape = parent.ancestor(Shape.type);
			if (!this.shape)
				throw Error('Invalid parent for Stroke node:' + this.nodePath);
		}
		this._component = new Component('path', null, this._shape.component, { fill: 'none' });

		// Initialize the child nodes
		this._color = new Color('color', this, 'url(#Accent)');
		this._width = new Number('width', this, 1, 0, 0);
		this._offset = new Number('offset', this, 0, 0, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}

	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The component of the Stroke. */
	get shape() { return this._shape; }

	/** The component of the Stroke. */
	get component() { return this._component; }

	/** The color of the Stroke. */
	get color() { return this._color; }

	/** The width of the Stroke. */
	get width() { return this._width; }

	/** The offset of the Stroke. */
	get offset() { return this._offset; }


	update(time, forced) {
		if (!this._offset.updated) {
			let offset = this._offset.value;
			let shape = offset > 0 ? this.shape.toSVG(offset) :
				this._shape.fill.get('d');
			this._component.set('d', shape);
		}
		if (!this._color.updated) {
			let colorData = this._color.toString();
			if (colorData.startsWith('url(#'))
				colorData = 'url(#' +
					this.component.rootName + 'Color' + colorData.slice(5);
			this._component.set('stroke', colorData);
		}
		if (!this._width.updated)
			this._component.set('stroke-width', this._width.value);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Stroke class. */
Stroke.type = new NodeType('Stroke', 'stroke', Node.type, Stroke);








/** Defines a circular shape. */
export class Circle extends Shape {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Circle instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, null, Circle.type);

		// Initialize the child nodes
		this._radius = new Number('radius', this, undefined, 64, 0);
		this._segments = new Number('segments', this, undefined, 4, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The radius of the Circle. */
	get radius() { return this._radius; }

	/** The number of segments of the Circle. */
	get segments() { return this._segments; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the widget.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._radius.updated) {
			this._paths.clear();
			let radius = this._radius.value, segments = this._segments.value, path = new Path('circlePath', this._paths), segment, angle = 0, a = 2 * Math.PI / segments;
			for (segment = 0; segment < segments; segment++, angle += a) {
				new Arc('segment ' + segment, path.segments, {
					radius: this.radius.value,
					start: [Math.sin(angle) * radius, -Math.cos(angle) * radius],
					end: [Math.sin(angle + a) * radius, -Math.cos(angle + a) * radius]
				});
			}
			this._width.value = radius * 2;
			this._height.value = radius * 2;
		}

		// Call the parent class method
		super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Circle class. */
Circle.type = new NodeType('Circle', 'circle', Shape.type, Circle);








/** Defines a rectangular shape. */
export class Rectangle extends Shape {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Rectangle instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, null, Rectangle.type);

		// Initialize the child nodes
		this._width = new Number('width', this, undefined, 128, 0);
		this._height = new Number('height', this, undefined, 128, 0);
		this._radius = new Number('radius', this, undefined, 0, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The width of the Rectangle. */
	get width() { return this._width; }

	/** The height of the Rectangle. */
	get height() { return this._height; }

	/** The radius of the Rectangle. */
	get radius() { return this._radius; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the widget.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._width.updated || !this._height.updated ||
			!this._radius.updated) {
			this._paths.clear();
			let path = new Path('rectanglePath', this._paths), width = this._width.value, w = width / 2, height = this._height.value, h = height / 2, radius = this._radius.value;
			if (radius > w)
				radius = w;
			if (radius > h)
				radius = h;

			let segments = path.segments;
			segments.clear();

			if (radius == 0) {
				new Line('top', segments, { start: [-w, -h], end: [w, -h] });
				new Line('right', segments, { start: [w, -h], end: [w, h] });
				new Line('bottom', segments, { start: [w, h], end: [-w, h] });
				new Line('left', segments, { start: [-w, h], end: [-w, -h] });
			}
			else {
				let wr = w - radius, hr = h - radius;
				new Line('top', segments, { start: [-wr, -h], end: [wr, -h] });
				new Arc('top-right', segments, { start: [wr, -h], end: [w, -hr],
					radius: radius });
				new Line('right', segments, { start: [w, -hr], end: [w, hr] });
				new Arc('right-bottom', segments, { start: [w, hr], end: [wr, h],
					radius: radius });
				new Line('bottom', segments, { start: [wr, h], end: [-wr, h] });
				new Arc('bottom-left', segments, { start: [-wr, h], end: [-w, hr],
					radius: radius });
				new Line('left', segments, { start: [-w, hr], end: [-w, -hr] });
				new Arc('left-top', segments, { start: [-w, -hr], end: [-wr, -h],
					radius: radius });

			}

		}

		// Call the parent class method
		super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Rectangle class. */
Rectangle.type = new NodeType('Rectangle', 'rectangle', Shape.type, Rectangle);








/** Defines a polygonal shape. */
export class Polygon extends Shape {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Polygon instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, null, Polygon.type);

		// Initialize the child nodes
		this._radius = new Number('radius', this, undefined, 64, 0);
		this._segments = new Number('segments', this, undefined, 4, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The radius of the Polygon. */
	get radius() { return this._radius; }

	/** The number of segments of the Polygon. */
	get segments() { return this._segments; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the widget.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._radius.updated) {
			this._paths.clear();
			let radius = this._radius.value, segments = this._segments.value, path = new Path('polygonPath', this._paths), segment, angle = 0, a = 2 * Math.PI / segments;
			for (segment = 0; segment < segments; segment++, angle += a) {
				new Line('segment ' + segment, path.segments, {
					start: [Math.sin(angle) * radius, -Math.cos(angle) * radius],
					end: [Math.sin(angle + a) * radius, -Math.cos(angle + a) * radius]
				});
			}
			this._width.value = radius * 2;
			this._height.value = radius * 2;
		}

		// Call the parent class method
		super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Polygon class. */
Polygon.type = new NodeType('Polygon', 'polygon', Shape.type, Polygon);







/** Defines a text shape. */
export class Text extends Shape {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Text instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, null, Text.type, 'text');

		// Initialize the child nodes
		this._content = new String('content', this, undefined, '[TEXT]');
		this._font = new String('font', this, undefined, 'Arial');
		this._weight = new String('weight', this, undefined, 'bold');
		this._fontSize = new Number('fontSize', this, undefined, 20);
		this._align = new String('align', this, undefined, 'center', Text.align);

		// Initialize the list of components
		this._lines = [];

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES


	/** The font of the Text. */
	get font() { return this._font; }

	/** The font weight of the Text. */
	get weight() { return this._weight; }

	/** The font size of the Text. */
	get fontSize() { return this._fontSize; }

	/** The horizontal align of the Text. */
	get align() { return this._align; }

	/** The anchor of the Text. */
	get anchor() { return this._anchor; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Text.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		if (!this._font.updated)
			this._path.set('font-family', this._font.value);

		if (!this._weight.updated)
			this._path.set('font-weight', this._weight.value);

		if (!this._content.updated || !this._align.updated
			|| !this._fontSize.updated) {

			this._content.update();
			let lines = this._content.value.split('\n'), lineIndex = 0, lineCount = lines.length, lineHeight = this._fontSize.value;

			this._path.set('font-size', lineHeight);


			// Adjust the number of components for the lines
			while (this._lines.length < lineCount)
				this._lines.push(new Component('tspan', null, this._path));
			while (this._lines.length > lineCount)
				this._path.element.removeChild(this._lines.pop().element);


			// Adjust the position of the objects
			let x = 0, y = 0, w = 0, h = lineHeight * lineCount;
			if (this._path.element) {
				// let bb = (this._fill.element as SVGGraphicsElement)
				// 	.getBBox({clipped:true});
				let bb = this._path.element.getBoundingClientRect();
				w = bb.width; //h = bb.height;
			}
			let horizontal = 'middle', vertical = 'middle';
			switch (this._align.value) {
				case 'left':
					horizontal = 'start';
					break;
				case 'center':
					x += w / 2;
					horizontal = 'middle';
					break;
				case 'right':
					x += w;
					horizontal = 'end';
					break;
			}
			switch (this._anchor.value) {
				case 'top':
					x -= w / 2;
					vertical = 'top';
					break;
				case 'top-right':
					x -= w;
					vertical = 'top';
					break;
				case 'left':
					x = 0;
					y += h / 2;
					break;
				case 'center':
					x -= w / 2;
					y += h / 2;
					break;
				case 'right':
					x -= w;
					y += h / 2;
					break;
				case 'bottom-left':
					y += h;
					vertical = 'bottom';
					break;
				case 'bottom':
					x -= w / 2;
					y += h;
					vertical = 'bottom';
					break;
				case 'bottom-right':
					x -= w;
					y += h;
					vertical = 'bottom';
					break;
			}

			for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
				let line = this._lines[lineIndex];
				line.content = lines[lineIndex];
				line.set('x', "0");
				line.set('y', (lineHeight * lineIndex) - y);
			}
			// this._fill.setAttribute('line-height', lineHeight);
			this._path.set('text-anchor', horizontal);
			this._path.set('dominant-baseline', vertical);
		}
		// Update the transform of the element to place the object


		// Call the parent class method
		super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Text class. */
Text.type = new NodeType('Text', 'text', Shape.type, Text);

/** The different alignment value. */
Text.align = ['left', 'center', 'right'];










/** Defines an Animation. */
export class Animation extends Node {



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Animation instance.
	 * @param name The node name.
	 * @param parent The KnowledgeGraph reference.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, Animation.type);

		// Create the child nodes
		this._curves = new NodeSet('curves', this, AnimationCurve.type);
		this._autoplay = new Boolean('autoplay', this);
		this._reverse = new Boolean('reverse', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// If the autoplay option is active, start playing the animation.
		if (this._autoplay.value)
			this.play();
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The curves of the animation. */
	get curves() { return this._curves; }

	/** Indicates if the animation should be played automatically. */
	get autoplay() { return this._autoplay; }

	/** Indicates if the animation should be played in reverse . */
	get reverse() { return this._reverse; }

	/** The curves of the animation. */
	get currentTime() { return this._currentTime; }

	/** The curves of the animation. */
	get previousTime() { return this._previousTime; }


	/** Plays the Animation. */
	play(times = 1, reverse = false) {

		// Ensure that no animation operate in NodeJs
		if (SHISHOU.environment == 'node')
			return;

		this._previousTime = undefined;
		this._reverse.value = reverse;

		// Starts the update process
		this.update(document.timeline.currentTime.valueOf());
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Animation class. */
Animation.type = new NodeType('Animation', 'animation', Node.type, Animation);



/** Defines an animation curve. */
export class AnimationCurve extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Animation instance.
	 * @param name The node name.
	 * @param parent The KnowledgeGraph reference.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, Animation.type);

		// Create the child nodes
		this._property = new String('property', this);
		this._keys = new NodeSet('keys', this, AnimationKey.type);
		this._easing = new String('easing', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The property of the AnimationCurve. */
	get property() { return this._property; }

	/** The keys of the AnimationCurve. */
	get keys() { return this._keys; }

	/** The easing function of the AnimationCurve. */
	get easing() { return this._easing; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the AnimationCurve class. */
AnimationCurve.type = new NodeType('AnimationCurve', 'curve', Node.type, AnimationCurve);



/** Defines an animation key. */
export class AnimationKey extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Animation instance.
	 * @param name The node name.
	 * @param parent The KnowledgeGraph reference.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		super(name, parent, undefined, AnimationKey.type);

		// Create the child nodes
		this._time = new Number('time', this);
		this._value = new Number('value', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The time of the AnimationKey. */
	get time() { return this._time; }

	/** The value of the AnimationKey. */
	get value() { return this._value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the AnimationKey class. */
AnimationKey.type = new NodeType('AnimationKey', 'key', Node.type, AnimationKey);










/** Defines a visual style. */
export class Style extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Style node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Style.type);

		// Initialize the child nodes
		this._colors = new NodeSet('colors', this, Color.type);
		this._font = new String('font', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The color palette of the Style. */
	get colors() { return this._colors; }

	/** The font name of the Style. */
	get font() { return this._font; }


	// --------------------------------------------------------- PUBLIC METHODS

	apply(duration = 0) {

		// Get the viewport instance
		let viewport = this.ancestor(Viewport.type);
		if (!viewport)
			throw Error('Unable to apply style: ' + this.nodePath);
		let resourcesComponent = viewport.resourcesComponent;

		for (let color of this._colors) {
			let colorName = viewport.name + 'Color' + color.name;
			let component = resourcesComponent.getChild(colorName);
			if (!component)
				component = new Component('linearGradient', colorName, resourcesComponent, undefined, undefined, false);
			component.content = '<stop stop-color="' + color.toString() +
				'" stop-opacity="1"/>';
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Style class. */
Style.type = new NodeType('Style', 'style', Node.type, Style);















/** Defines a Viewport to display the user interface. */
export class Viewport extends Element {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Viewport instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the parent class constructor
		let uniqueId = name || 'Viewport' +
			(Viewport.instances.length > 0 ? Viewport.instances.length : '');
		super(uniqueId, parent, undefined, Viewport.type, new Component('svg', uniqueId, undefined, { xmlns: 'http://www.w3.org/2000/svg', version: "1.1",
			'xmlns:xlink': "http://www.w3.org/1999/xlink",
			style: 'user-select: none; overflow: hidden; ' +
				'width: 16px; height:16px; background: none;' }));

		// Add the instance to the list
		Viewport.instances.push(this);

		// Create the sub-components
		let resourcesId = uniqueId + ' Resources', scriptsId = uniqueId + ' Scripts', backgroundId = uniqueId + ' Background', layersId = uniqueId + ' Layers';
		this._resourcesComponent = new Component('defs', resourcesId, this._component, { id: resourcesId });
		this._scriptComponent = new Component('script', scriptsId, this._component, { id: scriptsId });
		this._backgroundComponent = new Component('rect', backgroundId, this._component, { id: backgroundId, fill: 'url(#' + uniqueId + 'Color)' });
		this._layersComponent = new Component('g', layersId, this._component, { id: layersId });

		// Initialize the child nodes
		this._state = new String('state', this, undefined, 'normal', Viewport.states);
		this._style = new String('style', this);
		this._parentElement = new String('parentElement', this);
		this._color = new Color('color', this);
		this._styles = new NodeSet('styles', this, Style.type);
		this._shapes = new NodeSet('shapes', this, Shape.type);
		this._layers = new NodeSet('layers', this, Layer.type);

		// Set the default size
		this._width.default = 512;
		this._height.default = 256;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// If no style is defined, create a default one
		if (this._styles.count == 0) {
			new Style('default', this._styles, Viewport.defaultStyle);
			this._style.value = 'default';
		}
		else if (this._style.value == undefined)
			this._style.value = this._styles.getByIndex(0).name;

		// if the re is a parent HTML element
		let parentElementId = this._parentElement.value;
		if (parentElementId != undefined) {
			let parentElement = document.getElementById(parentElementId);
			if (!parentElement)
				throw Error('Invalid HTML Element ID: "' +
					parentElementId + '" for: ' + this.nodePath);
			parentElement.append(this._component.element);
		}

		// Resize the viewport
		this.resize(undefined, undefined, true);
		if (SHISHOU.environment == 'browser')
			window.addEventListener('resize', () => { this.resize(); });

		// Start the update
		this.update();
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES


	/** The resources Component of the Viewport. */
	get resourcesComponent() { return this._resourcesComponent; }

	/** The script Component of the Viewport. */
	get scriptComponent() { return this._scriptComponent; }

	/** The background Component of the Viewport. */
	get backgroundComponent() { return this._backgroundComponent; }

	/** The layers Component of the Viewport. */
	get layersComponent() { return this._layersComponent; }

	/** The state of the Viewport (hidden, normal, maximized or fullscreen). */
	get state() { return this._state; }

	/** The name of the current style of the Viewport. */
	get style() { return this._style; }

	/** The id of the parent HTML element where of the Viewport. */
	get parentElement() { return this._parentElement; }

	/** The color of the Viewport. */
	get color() { return this._color; }

	/** The styles of the Viewport. */
	get styles() { return this._styles; }

	/** The shapes of the Viewport. */
	get shapes() { return this._shapes; }

	/** The layers of the Viewport. */
	get layers() { return this._layers; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Viewport.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// Update the style
		if (!this._style.updated && this.styles.count > 0) {
			let style = this._styles.get(this._style.value);
			if (!style)
				throw Error('Invalid style: ' + this._style.value);
			style.apply();
		}

		// If the size is changed, update
		if (Node.modified(this.state, this._width, this._height))
			this.resize(this._width.value, this._height.value);

		// If the color is updated, change the background
		if (!this._color.updated) {
			let colorData = this._color.toString();
			if (colorData.startsWith('url(#'))
				colorData = 'url(#' +
					this.component.rootName + 'Color' + colorData.slice(5);
			this._backgroundComponent.set('fill', colorData);
		}

		// Request a new update as soon as possible 
		if (SHISHOU.environment == 'browser')
			requestAnimationFrame(this.update.bind(this));

		// Call the parent class method
		super.update(time, forced);
	}


	/** Resizes the Viewport.
	 * @param {number} width The width of the Viewport (in pixels).
	 * @param {number} height The height of the Viewport (in pixels). */
	resize(width, height, forced = false) {

		// If we are working on a browser, there are different states
		if (SHISHOU.environment == 'browser') {
			let element = this._component.element;
			switch (this._state.value) {
				case 'hidden': break;
				case 'normal':
					if (width == undefined)
						width = this._width.value;
					if (height == undefined)
						height = this._height.value;
					element.style.position = 'inline';
					element.style.width = width + 'px';
					element.style.height = height + 'px';
					break;
				case 'maximized':
					element.style.position =
						(this._parentElement.isUndefined) ? 'fixed' : 'relative';
					element.style.top = '0';
					element.style.left = '0';
					element.style.width = '100%';
					element.style.height = '100%';
					break;
			}
			// The with and height is determined by the element itself
			width = element.clientWidth;
			height = element.clientHeight;

		}

		// If the new size is the same as before, do nothing
		if (!forced && this._width.value == width &&
			this._height.value == height)
			return;

		// Save the new values
		this._width.value = width;
		this._height.value = height;

		// Define the viewbox property
		this._component.set('viewBox', '0 0 ' + width + ' ' + height);

		// Update the properties of the background
		let background = this._backgroundComponent;
		if (!this._width.updated)
			background.set('width', this._width.value);
		if (!this._height.updated)
			background.set('height', this._height.value);

		// Show a message on console
		if (this.debug)
			console.log("Resized Viewport " + this.name + ': ' +
				width + ' x ' + height + ' (' + this._state.value + ')');

		// Resize of the layers
		for (let layer of this._layers)
			layer.resize(width, height);

		// Mark the size as updated
		this._width.update();
		this._height.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Viewport class. */
Viewport.type = new NodeType('Viewport', 'viewport', Element.type, Viewport);


// --------------------------------------------------------- STATIC FIELDS

/** The different valid states of the Viewport. */
Viewport.states = ['hidden', 'normal', 'maximized', 'fullscreen'];

/** The default width of the Viewport. */
Viewport.defaultWidth = 512;

/** The default height of the Viewport. */
Viewport.defaultHeight = 256;

/** The default style. */
Viewport.defaultStyle = {
	font: 'Arial',
	colors: {
		Background: '#00000',
		Foreground: '#FFFFFF',
		Accent: '#B400CF'
	}
};

/** The global list of instances of the KnowledgeGraph class. */
Viewport.instances = [];







/** Defines an Context node. */
export class Context extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Context instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Context.type);

		// Initialize the child nodes
		this._variable = new NodeLink('variable', this);
		this._value = new String('value', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The variable of the Context. */ ;

	/** The value of the Context */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The variable of the Context. */ ;
	get variable() { return this._variable; }

	/** The value of the Context. */ ;
	get value() { return this._value; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Context.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {
		super.update(time, forced);
	}


	/** Validates the Context.
	 * @return Whether the context is valid or not. */
	validate() {

		if (this.value.isUndefined)
			return true;

		if (!this.variable.updated)
			this.variable.update();

		let ref = this.variable.node;
		let result = ref.value == this.value.value;
		// return ref.value == this.value.value;
		// console.log('Validate: ' + result);
		return result;
	}

	toString() {
		if (!this.variable.node)
			return '{Undefined}';
		return this.variable.node.name + ' == ' + this._value.value;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Context class. */
Context.type = new NodeType('Context', 'context', Node.type, Context);








/** Defines an Action node. */
export class Action extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Action instance.
	 * @param name The name of the instance.
	 * @param data The initialization data.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Action.type);

		// Initialize the child nodes
		this._event = new String('event', this);
		this._variable = new NodeLink('variable', this);
		this._value = new String('value', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The event of the Action. */ ;

	/** The variable of the Action. */ ;

	/** The value of the Action */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The event of the Action. */ ;
	get event() { return this._event; }

	/** The variable of the Action. */ ;
	get variable() { return this._variable; }

	/** The value of the Action. */ ;
	get value() { return this._value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Action class. */
Action.type = new NodeType('Action', 'action', Node.type, Action);













/** Defines a Widget of the user interface. */
export class Widget extends Element {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Widget instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of Widget. */
	constructor(name, parent, data, type = Widget.type) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Initialize the child nodes
		this._abstract = new Boolean('abstract', this);
		this._extends = new NodeLink('extends', this);
		this._context = new Context('context', this);
		this._variables = new NodeSet('variables', this, Simple.type);
		this._actions = new NodeSet('actions', this, Action.type);
		this._shapes = new NodeSet('shapes', this, Shape.type);
		this._widgets = new NodeSet('widgets', this, Widget.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		this._component.element.addEventListener('click', (event) => { this.react(event); });
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The whether the node is abstract or not. */
	get abstract() { return this._abstract; }

	/** The Widget node to extend from. */
	get extends() { return this._extends; }

	/** The context of the Widget. */
	get context() { return this._context; }

	/** The variables of the Widget. */
	get variables() { return this._variables; }

	/** The actions of the Widget. */
	get actions() { return this._actions; }

	/** The shapes of the Widget. */
	get shapes() { return this._shapes; }

	/** The child widgets of the Widget. */
	get widgets() { return this._widgets; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Acts to a particular event.
	 * @param event The event to react to. */
	react(event) {
		let actionPerformed = false;
		for (let action of this._actions) {
			if (action.event.value == event.type) {
				let node = action.variable.node;
				node.value = action.value.value;
				actionPerformed = true;
				console.log('Set: ' + node.nodePath + ' <- ' + node.value);
			}
		}
		if (actionPerformed)
			event.stopPropagation();
	}

	/** Deserializes data into the instance.
	 * @param data The DataNode with the data to deserialize. */
	deserialize(data = {}) {

		// Check the data 
		if (data == undefined || typeof data != 'object')
			return;

		// If it is an extension mechanism get the data from the node
		if (data.extends) {
			this._extends.reference = data.extends;
			let target = this._extends.node;
			let copyData = target.serialize();
			if (copyData.abstract)
				copyData.abstract = undefined;
			for (let key in copyData)
				if (!data[key])
					data[key] = copyData[key];
		}

		// Get the data items (in the provided order)
		let items = Object.keys(data);
		for (let item of items)
			if (this._children[item] != undefined && data[item] != undefined)
				this.children[item].deserialize(data[item]);

		// Get the debug data
		if (data.debug)
			this._debug = data;
	}


	/** Updates the Widget.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// Skip rendering abstract
		if (this._abstract.value == true)
			return;

		// Validate the context
		// console.log("Validate Context: " + this.name + '->' + this.context.toString())
		let con = this._context.validate();
		this._component.set('visibility', con ? 'visible' : 'hidden');

		// Call the parent class method
		super.update(time, forced);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Widget class. */
Widget.type = new NodeType('Widget', 'widget', Widget.type, Widget);













/** Defines a Layer of the user interface. */
export class Layer extends Element {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Layer instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of Layer. */
	constructor(name, parent, data, type = Layer.type) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Initialize the child nodes
		this._pan = new Boolean('pan', this, undefined, false);
		this._zoom = new Number('zoom', this, undefined, 1, 0.1, 10);
		this._shapes = new NodeSet('shapes', this, Shape.type);
		this._widgets = new NodeSet('widgets', this, Widget.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// Associate the layer to the right component of the viewport
		let viewport = this.ancestor(Viewport.type);
		if (!viewport)
			throw Error('Layer without viewport: ' + this.nodePath);
		viewport.layersComponent.addChild(this._component);

		// Handle the events
		let parentElement = viewport.component.element;
		parentElement.addEventListener("contextmenu", e => e.preventDefault());
		parentElement.addEventListener('mousedown', (e) => {
			if (!this._pan.value)
				return;
			this.react('down', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		parentElement.addEventListener('mousemove', (e) => {
			if (!this._pan.value)
				return;
			this.react('move', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		parentElement.addEventListener('mouseup', (e) => {
			if (!this._pan.value)
				return;
			this.react('up', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		parentElement.addEventListener('wheel', (e) => {
			if (!this._pan.value)
				return;
			this.react('zoom', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY, e.deltaY < 0 ? 0.1 : -0.1);
			e.preventDefault();
		});
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Whether to enable panning the layer or not. */
	get pan() { return this._pan; }

	/** The zoom factor of the layer. */
	get zoom() { return this._zoom; }

	/** The shapes of the layer. */
	get shapes() { return this._shapes; }

	/** The child widgets of the layer. */
	get widgets() { return this._widgets; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes a data item into the instance.
	 * @param data The DataNode with the data to deserialize. */
	deserialize(data) {

		// Create a debug component 
		if (data && data.debug && !this._debugComponent) {
			this._debugComponent = new Component('g', undefined, this._component, { 'stroke-linecap': 'round' });
			function createGrid(name, size, width, divisions = 10, parentComponent) {
				let grid = new Component('g', name, parentComponent, { id: name, stroke: 'gray', "stroke-width": width });
				let s = size / 2, cellSize = size / divisions;
				for (let a = -s; a <= s; a += cellSize) {
					new Component('line', null, grid, { x1: -s, y1: a, x2: s, y2: a });
					new Component('line', null, grid, { x1: a, y1: -s, x2: a, y2: s });
				}
			}
			createGrid('grid1', 1000, 0.5, 10, this._debugComponent);
			createGrid('grid2', 200, 0.2, 20, this._debugComponent);
			new Component('line', undefined, this._debugComponent, { y1: -1000, y2: 1000, stroke: "green" });
			new Component('line', undefined, this._debugComponent, { x1: -1000, x2: 1000, stroke: "red" });
		}

		// Call the parent class method
		super.deserialize(data);
	}

	/** Updates the Element.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		let updateTransform = (Node.modified(this._width, this._height, this._position, this._offset, this._zoom));

		// Call the parent class method
		super.update(time, forced);

		//
		if (updateTransform) {
			let x = this._position.x.value, y = this._position.y.value, ox = this._offset.x.value, oy = this._offset.y.value, w = this._width.value, h = this._height.value, z = this._zoom.value;

			// if (this._debugComponent) {
			// 	this._debugComponent.set('width', w);
			// 	this._debugComponent.set('height', h);
			// }
			this._component.set('transform', 'scale(' + Number.toString(z) + ') ' +
				'translate(' + Number.toString((x + ox) / z) + ', ' +
				Number.toString((y + oy) / z) + ')');
			// console.log(this._component.get('transform'));
		}

	}


	/** Resizes the layer.
	 * @param width The width of the layer.
	 * @param height The height of the layer. */
	resize(width = 0, height = 0) {
		this._offset.x.value = width / 2;
		this._offset.y.value = height / 2;
		this._width.value = width;
		this._height.value = height;
	}


	/** Reacts to an action.
	 * @param action The action to react to.
	 * @param button The button of the action.
	 * @param x The target in the X axis.
	 * @param y The target in the Y axis.
	 * @param mx The movement in the X axis.
	 * @param my The movement in the Y axis.
	 * @param mz The movement in the Z axis. */
	react(action, button, x, y, mx, my, mz) {

		// Select the action
		if (action == 'move') {
			switch (button) {
				case 1:
					this._position.addValues(mx, my);
					return;
				// case 2: 
				// 	this._longitude.value += mx; 
				// 	this._latitude.value += my; 
				// 	return;
			}
		}
		if (action == 'zoom') {
			// Update the zoom value
			let oldZoom = this._zoom.value, newZoom = this._zoom.value + mz;
			if (newZoom < this._zoom.min)
				newZoom = this._zoom.min;
			if (newZoom > this._zoom.max)
				newZoom = this._zoom.max;
			this._zoom.value = newZoom;
			newZoom = this._zoom.value;

			// // Calculate the relative target
			let relX = -(this._position.x.value + this._offset.x.value), relY = -(this._position.y.value + this._offset.y.value);

			// // Get the old and new targets in the 2D space
			let oldX = (x + relX) * oldZoom, oldY = (y + relY) * oldZoom, newX = (x + relX) * newZoom, newY = (y + relY) * newZoom;

			// Debug
			// function f(number: number): string { return number.toFixed(); }
			// console.log(
			// 	' Old: ' + f(oldX) + ', ' + f(oldY) + ', ' + f(oldZoom) +
			// 	' New: ' + f(newX) + ', ' + f(newY) + ', ' + f(newZoom));

			// // Update the values of the view and re-target it
			this._position.x.value += (oldX - newX) / oldZoom;
			this._position.y.value += (oldY - newY) / oldZoom;
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Layer class. */
Layer.type = new NodeType('Layer', 'layer', Element.type, Layer);










/** Defines a Widget Generator. */
export class Generator extends Widget {


	// ------------------------------------------------------ PUBLIC PROPERTIES



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Generator instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of Layer. */
	constructor(name, parent, data, type = Generator.type) {

		// Call the parent class constructor
		super(name, parent, undefined, type);

		// Initialize the child nodes
		this._widget = new NodeLink('widget', this);
		this._seed = new Number('seed', this);
		this._classType = new String('class', this);
		this._linkColor = new Color('color', this);

		// The random number generator
		// this._random = new Random();

		// The list of the classes
		this._classes = {};

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Widget.
	 * @param time The current time in milliseconds.
	 * @param forced Whether to force the update or not. */
	update(time, forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this.updated && !forced)
			return;

		// Skip rendering abstract widgets
		if (this._abstract.value == true)
			return;

		if (!this._widget.updated)
			this._widget.update();

		// Get the data model
		let root = this.ancestor(SHISHOU.type);
		let model = root.model;

		// Create the lines
		let lines = {}, lineArray = [], lineIndex = 0, colors = ['#ef1de5', '#037e8e', '#00abcd',
			'#620d7d', '#b206f9', '#082ebf', '#a59dcc', '#582bb1'], widths = [10, 10, 10, 10, 10, 10, 10, 10];
		for (let lineData of model.relations) {
			let line = { name: lineData.name, nodes: [], path: [],
				color: colors[lineIndex], width: widths[lineIndex],
				links: [], segments: [], paths: [] };
			lines[lineData.name] = line;
			lineArray.push(line);
			lineIndex++;
		}
		let lineNames = Object.keys(lines), lineCount = lineNames.length;


		// Create the graph nodes 
		let nodes = {}, nodeArray = [];
		for (let nodeData of model.classes) {
			if (nodeData.abstract.value)
				continue;
			let node = { name: nodeData.name,
				data: nodeData, lines: [], links: [],
				position: new Vector(nodeData.name + 'Position') };

			for (let relation of nodeData.relations) {
				node.lines.push(relation.name);
				lines[relation.name].nodes.push(nodeData.name);
			}
			node.lineCount = node.lines.length;
			nodes[nodeData.name] = node;
			nodeArray.push(node);
		}
		let nodeNames = Object.keys(nodes), nodeCount = nodeNames.length;


		// Create sorted list of the nodes and lines
		let sortedLines = lineArray.sort((a, b) => b.nodes.length - a.nodes.length);
		let sortedNodes = nodeArray.sort((a, b) => b.lines.length - a.lines.length);


		// Create the grid to make it easier to place elements
		let grid = [], gridRadius = 64, gridSize = 1 + gridRadius * 2, gridCenter = gridRadius, cursorX = 0, cursorY = 0, positionedNodes = 0, separation = 3, cellSize = 100, previousNodeInLine;
		for (let y = 0; y < gridSize; y++) {
			let row = [];
			grid.push(row);
			for (let x = 0; x < gridSize; x++)
				row.push({ node: undefined, direction: undefined, links: [] });
		}

		// Create the lines (and their points and links)
		let links = {}, linksArray = [];
		for (let line of sortedLines) {

			// Sort the nodes by the number of lines they belong to
			line.nodes = line.nodes.sort((a, b) => nodes[b].lines.length - nodes[a].lines.length);

			// Reset the previous node
			previousNodeInLine = null;

			// Place the elements of the line
			for (let nodeName of line.nodes) {
				let node = nodes[nodeName];

				// If the node is not positioned, find the best place
				if (node.position.isUndefined) {

					// TODO improve this part
					// Place the nodes in an spiral
					let a = (positionedNodes * 30), r = a * Math.PI / 180, distance = 2 + (a / 360), oX = Math.round(distance * Math.sin(r)), oY = Math.round(distance * Math.cos(r));

					let x = cursorX + oX * separation, y = cursorY + oY * separation, cell = grid[gridCenter + x][gridCenter + y];

					if (!cell.node) {
						cell.node = node;
						node.position.set(x, y);
						positionedNodes++;
						console.log('Set: "' + node.name + '": ' + x + ', ' + y);
					}
					else
						throw Error('There is already a node in that cell');
				}

				// Skip creating the lines
				if (!previousNodeInLine) {
					previousNodeInLine = node;
					continue;
				}

				// Create the links between the nodes
				let start = previousNodeInLine.position, end = node.position, current = start.values, goal = end.values, link = { line: line.name, start: previousNodeInLine.name,
					end: node.name, path: [current] };


				// Look for the path to the
				let iterations = 0, maxIterations = 1000;
				while (++iterations < maxIterations) {

					// Create the possible options
					let options = [
						{ x: current.x + 0, y: current.y - 1 },
						{ x: current.x + 1, y: current.y - 1 },
						{ x: current.x + 1, y: current.y + 0 },
						{ x: current.x + 1, y: current.y + 1 },
						{ x: current.x + 0, y: current.y + 1 },
						{ x: current.x - 1, y: current.y + 1 },
						{ x: current.x - 1, y: current.y + 0 },
						{ x: current.x - 1, y: current.y - 1 }, // NW
					];

					// Choose the best option based on an utility function
					let bestOption = undefined, bestUtility = 10000;
					for (let option of options) {

						// If the cell contains a node, ski`it
						let c = grid[gridCenter + option.x][gridCenter + option.y];

						// Calculate the distance to the goal
						let d = { x: goal.x - option.x, y: goal.y - option.y };

						// Check if we reached the goal
						if (d.x == 0 && d.y == 0) {
							bestOption = option;
							bestUtility = 0;
							break;
						}

						// If it is any other node, just skip it
						if (c.node)
							continue;

						// The distance is the main component of the utility
						let utility = Math.sqrt(d.x * d.x + d.y * d.y);

						// Avoid other links
						// utility += c.links.length * 0.1;

						// If it is the best option yet, save it and continue
						if (utility < bestUtility) {
							bestUtility = utility;
							bestOption = option;
						}
					}
					// Save the best option as part of the pat
					link.path.push(bestOption);

					// Check if we have reached the goal or we have to continue
					if (bestUtility > 0)
						current = bestOption;
					else
						break;
				}
				if (iterations == maxIterations)
					throw Error('Unable to create link between "' + link.start +
						'" and "' + link.end + '"');

				// Save the links in the cells, the nodes and a global array
				let pathIndex, pathLength = link.path.length;
				for (pathIndex = 1; pathIndex < pathLength - 1; pathIndex++) {
					let pos = link.path[pathIndex], cell = grid[pos.x + gridRadius][pos.y + gridRadius];
					cell.links.push(link);
				}
				node.links.push(link);
				linksArray.push(link);

				// Save the current node instance for the next link creation
				previousNodeInLine = node;
			}
		}

		// Convert the links into line segments
		for (let link of linksArray) {

			// console.log(link.line);
			let path = link.path, pathIndex, pathLength = link.path.length;
			for (pathIndex = 0; pathIndex < pathLength - 1; pathIndex++) {
				let a = path[pathIndex], b = path[pathIndex + 1], ax = a.x, ay = a.y, bx = b.x, by = b.y;

				// let ca = getCell(ax, ay), cal = ca = ca.links.length;
				// for (let li = 0; li < ca.links.length; li++)

				// a.x *= 100; a.y *= 100; b.x *= 100; b.y *= 100;
				let line = lines[link.line];
				line.segments.push({ type: 'line',
					start: { x: ax * 100, y: ay * 100 },
					end: { x: bx * 100, y: by * 100 } });
			}
		}

		// Draw the lines
		for (let line of lineArray) {
			if (line.segments.length == 0)
				continue;
			console.log(line.segments);
			this.shapes.add("shape", { color: "none",
				paths: [{ segments: line.segments }],
				strokes: [{ width: line.width, color: line.color }] });
		}

		// Create the widgets
		let widgetIndex = 1;
		for (let node of sortedNodes) {
			let widgetData = this._widget.node.serialize();
			if (!widgetData.name)
				widgetData.name = 'Widget';
			widgetData.name += widgetIndex;
			widgetData.abstract = false;
			if (!node.data.title.isUndefined)
				widgetData.variables.title = node.data.title.value;
			if (!node.data.description.isUndefined)
				widgetData.variables.description = node.data.description.value;
			if (node.position.isUndefined)
				continue;
			let p = node.position.values;
			widgetData.position = { x: p.x * cellSize, y: p.y * cellSize };
			this._widgets.add(widgetData.name, widgetData);
			widgetIndex++;
		}

		// Call the parent class method
		super.update(time, forced);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Generator class. */
Generator.type = new NodeType('Generator', 'generator', Widget.type, Generator);


// --------------------------------------------------------------- EXPORTS LIST

// To avoid cyclical import errors, the following list provides access to the 
// different classes of the project in the right order.
// Note: While Typescript does not require adding the extension at the end, 
// after the transpilation, it is necessary for the file URL to end in ".js".

// Data nodes






// Data serialization


// Data types








// Data model










// Graphics engine













// View












// --------------------------------------------------------------- IMPORTS LIST










/** The main class of the SHISHOU platform. */
export class SHISHOU extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the SHISHOU instance.
	 * @param data The initialization data. */
	constructor(data) {

		// Call the base class constructor
		let instanceCount = SHISHOU.instances.length;
		super('SHISHOU' + (instanceCount > 0 ? '_' + instanceCount : ''), undefined, undefined, SHISHOU.type);

		// Add this instance to the list
		SHISHOU.instances.push(this);

		// Show a message on console
		if (instanceCount == 0)
			console.log('INITIALIZED ' + SHISHOU.name +
				' Version: ' + SHISHOU.version +
				' (Environment: ' + SHISHOU.environment + ')');

		// Create the child nodes
		this._title = new String('title', this, (data && data.title) ? data.title : this.name);
		this._model = new Model('model', this);
		this._viewports = new NodeSet('viewports', this, Viewport.type);

		// Deserialize the initialization data
		if (data) {
			if (typeof data != 'object')
				throw Error('Invalid data for ' + this.nodePath);
			this.deserialize(data);
		}

		//
		if (this._viewports.count == 0) {
			new Viewport('DefaultViewport', this._viewports, { state: 'maximized', layers: [{ pan: true, debug: true }] });

		}

		// Start updating everything
		this.update();
	}


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the SHISHOU instance. */
	get title() { return this._title; }

	/** The data model of the SHISHOU instance. */
	get model() { return this._model; }

	/** The Viewports of the SHISHOU instance. */
	get viewports() { return this._viewports; }


	// --------------------------------------------------------- PUBLIC METHODS

	/** Facilitates the creation of a new SHISHOU instance.
	 * @param data The initialization data. */
	static init(data) {
		if (typeof data == 'object')
			return new SHISHOU(data);
		else if (typeof data == 'string') {
			fetch(data).then((response) => response.text())
				.then((data) => {
				let d = JsonSerialization.deserialize(data);
				return new SHISHOU(d);
			});
		}
		else
			throw Error('Invalid data for SHISHOU initialization');
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the SHISHOU class. */
SHISHOU.type = new NodeType('SHISHOU', 'root', Node.type, SHISHOU);


// ---------------------------------------------------------- STATIC FIELDS

/** The version name of the SHISHOU framework. */
SHISHOU.version = '0.1';

/** The name of the SHISHOU framework. */
SHISHOU.instances = [];




// Check the type of environment the system is running on
SHISHOU.environment =
	([typeof window, typeof document].includes('undefined')) ? 'node' : 'browser';




//# sourceMappingURL=shishou.module.js.map