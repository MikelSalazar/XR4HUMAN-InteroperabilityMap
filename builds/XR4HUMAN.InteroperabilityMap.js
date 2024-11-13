// *********************************************************** data\NodeType.js

/** Defines the metadata of a node. */
	   class NodeType {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the NodeType. */
	get name() { return this._name; }

	/** The tag of the NodeType. */
	get tag() { return this._tag; }

	/** Indicates whether to serialize the node or not. */
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



// *************************************************************** data\Node.js




/** Defines a data node. */
	   class Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the Node. */
	get name() { return this._name; }

	/** The type of the node. */
	get type() { return this._type; }

	/** The update state of the Node. */
	get updated() { return this._updated; }
	set updated(updated) {
		updated = (updated == true);
		if (!updated && this._parent)
			this._parent.updated = false;
		this._updated = updated;
	}

	/** The update time of the Node. */
	get updateTime() { return this._updateTime; }

	/** The debug data of the Node. */
	get debug() { return this._debug; }
	set debug(d) { this._debug = d; }

	/** The id (path) of the Node. */
	get id() {
		return (this._parent ? this._parent.id + '/' : '') + this._name;
	}

	/** The parent of the Node. */
	get parent() { return this._parent; }

	/** The children of the Node. */
	get children() { return Object.values(this._children); }
	;


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Node instance.
	 * @param name The name of the Node.
	 * @param parent The parent of the Node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name, parent, data = {}, type = Node.type) {

		// Set the name and type of the node
		this._name = name || data.name;
		if (!this._name || Node._specialKeys.includes(this._name))
			throw Error('Invalid node name "' + this.name + '"');
		this._type = type;
		if (!this._type)
			throw Error('Invalid node type for: ' + this.id);

		// Establish the connection to the parent
		this._children = {};
		this._parent = parent;
		if (parent) {
			if (parent._children[this._name])
				throw Error('Repeated key: "' + this._name + '" for ' + parent.id);
			parent._children[this._name] = this;
			if (parent._updated)
				parent.updated = false;
		}

		// By default, the node is not updated
		this._updated = false;

		// Show a debug message on console
		this._debug = data.debug;
		if (this._debug)
			console.log('Created ' + this._type.name +
				' "' + this.id + '"');
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Retrieves an ancestor node of an specific type.
	 * @param type The type of node.
	 * @returns The first node that matches the condition. */
	ancestor(type) {
		let node = this.parent;
		while (node) {
			if (node instanceof type)
				break;
			node = node.parent;
		}
		return node;
	}


	/** Gets an specific child the Node.
	 * @param key The name of the child to get.
	 * @returns The specific Node requested (undefined if not found). */
	get(key) { return this._children[key]; }


	/** Updates the Node instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// Check if the node has to be updated
		if (this._updated && !forced)
			return;

		// Show a debug message
		// if (this.debug) console.log('Updated ' + this.id);

		// Update the child nodes (and check if they have been updated)
		this._updated = true;
		for (let child of this.children)
			if (!child.update(forced))
				this._updated = false;

		// Save the update time (even if it is not updated)
		this._updateTime = Date.now();

		// Return the current state
		return this._updated;
	}


	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data = {}) {

		// Check the data 
		if (data == undefined || typeof data != 'object')
			return;

		// Save the debug data
		this._debug = data.debug;

		// Get the child node data
		for (let key in data) {
			if (Node._specialKeys.includes(key))
				continue;
			if (this._children[key] != undefined)
				this._children[key].deserialize(data[key]);
			else
				console.warn('Unknown child node "' + key + '" for' + this.id);
		}
	}


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {

		// Create the data of the 
		let data = {}, itemCount = 0;

		// Set the name
		if (this._name)
			data.name = this._name;

		// Serialize the child nodes (excluding "undefined" values)
		for (let key in this._children) {
			let item = this._children[key].serialize(params);
			if (item == undefined)
				continue;
			data[key] = item;
			itemCount++;
		}

		// Return the data (if there is data to return)
		return (params.optimize && itemCount == 0) ? undefined : data;
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() { return JSON.stringify(this.serialize()); }


	/** Iterates through the children of the Node. */
	[Symbol.iterator]() {
		let pointer = 0, items = Object.values(this._children);
		return {
			next() {
				if (pointer < items.length)
					return { done: false, value: items[pointer++] };
				else
					return { done: true, value: null };
			}
		};
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Node class. */
Node.type = new NodeType('Node', 'node', null, Node);

/** The special keys that should not be used during the serialization. */
Node._specialKeys = ['name', 'debug', 'type'];


// ************************************************************ data\NodeSet.js




/** Defines a NodeSet. */
	   class NodeSet extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The name of the NodeSet. */
	get name() { return this._name; }

	/** The type of the Node instances in the NodeSet. */
	get type() { return this._type; }
	;

	/** Indicates whether the NodeSet uses indexes or not. */
	get indexed() { return this._indexed; }

	/** The keys of the Nodes of the NodeSet. */
	get keys() { return Object.keys(this._children); }

	/** The children of the NodeSet. */
	get children() { return Object.values(this._children); }
	;

	/** The number of items of the NodeSet. */
	get count() { return this.children.length; }

	/** The first item of the NodeSet. */
	get first() { return this.children[0]; }

	/** The last item of the NodeSet. */
	get last() { return this.children[this.children.length - 1]; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new NodeSet instance.
	 * @param name The name of the NodeSet.
	 * @param owner The parent Node.
	 * @param type The type of the Node instances in the NodeSet.
	 * @param data The initialization data. */
	constructor(name, parent, type, data) {

		// Call the base class constructor
		super(name, parent, undefined, NodeSet.type);

		// Save the type of the Node instances
		if (!type)
			throw Error('Invalid node type for: ' + this.id);
		this._type = type;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets an specific Node instance of the NodeSet.
	 * @param key The name or index of the Node to get.
	 * @returns The specific Node requested (undefined if not found). */
	get(key) {
		if (typeof key == 'string')
			return this._children[key];
		else if (typeof key == 'number') {
			let keys = window.Object.keys(this._children);
			if (key < 0 || key > keys.length)
				console.warn('Invalid index "' + key + '" for: ' + this.id);
			return this._children[keys[key]];
		}
		else
			console.warn('Invalid index "' + key + '" for: ' + this.id);
	}


	/** Deserializes JSON data into the NodeSet.
	 * @param data The deserialization data. */
	deserialize(data) {

		// Make sure there is data to deserialize
		if (data == undefined)
			return;

		// Get the items of the NodeSet
		if (Array.isArray(data)) {
			this._indexed = true;
			let index = 1;
			for (let item of data) {
				let nodeType = this._type;
				if (item.type) {
					nodeType = this._type.childTags[item.type];
					if (!nodeType)
						throw Error('Invalid type: "' + item.type + '" for: ' + this.id);
				}
				new nodeType.prototype('' + index++, this, item);
			}
		}
		else if (typeof data == 'object') {
			this._indexed = false;
			for (let key in data) {
				let item = data[key], nodeType = this._type;
				if (item.type) {
					nodeType = this._type.childTags[item.type];
					if (!nodeType)
						throw Error('Invalid type: "' + item.type + '" for: ' + this.id);
				}
				new nodeType.prototype(key, this, item);
			}
		}
		else
			throw Error('Invalid data "' + data + '" for: ' + this.id);
	}


	/** Serializes the NodeSet to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {
		if (this._indexed == true) {
			// Create the array to store the JSON representation
			let array = [];

			// Serialize the nodes
			let children = Object.values(this._children);
			for (let child of children)
				array.push(child.serialize());

			// Return the JSON representation
			return (array.length > 0 ? array : undefined);
		}
		else {
			// Create the array to store the JSON representation
			let obj = {}, itemCount = 0;

			// Serialize the nodes
			for (let childName in this._children) {
				let item = this._children[childName].serialize();
				if (item != undefined) {
					obj[childName] = item;
					itemCount++;
				}
			}

			// Return the JSON representation
			return (itemCount > 0 ? obj : undefined);
		}
	}


	/** Obtains the string representation of the NodeSet.
	 * @returns The string representation of the NodeSet. */
	toString() {
		let text = JSON.stringify(this.serialize());
		return this.name + ': ' + (text ? text : '[]');
	}


	/** Iterates through the items of the NodeSet. */
	[Symbol.iterator]() {
		let pointer = 0, items = Object.values(this._children);
		return {
			next() {
				if (pointer < items.length)
					return { done: false, value: items[pointer++] };
				else
					return { done: true, value: null };
			}
		};
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the NodeSet class. */
NodeSet.type = new NodeType('NodeSet', 'set', Node.type, NodeSet);


// *********************************************************** data\NodeLink.js





/** Defines a Node that links to another Node instance. */
	   class NodeLink extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The references of the NodeLink. */
	get references() { return this._references; }


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Initializes the NodeLink node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param origin The origin of the NodeLink.
	 * @param inverse The name of the inverse NodeLink. */
	constructor(name, parent, data, origin, inverse) {

		// Call the base class constructor
		super(name, parent, undefined, NodeLink.type);

		// Set the origin of the reference and the inverse link
		this._origin = origin;
		this._inverse = inverse;

		// Initialize the references of the link
		this._references = [];

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the NodeLink instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// Check if the node has to be updated
		if (this._updated && !forced)
			return;

		// Add the nodes references
		this._children = {};
		for (let reference of this._references) {
			let node = this._origin.get(reference);
			if (!node)
				throw Error('Invalid reference "' + reference + '"' +
					' for: ' + this.id);
			this._children[reference] = node;
			if (this._inverse) {
				let inverseLink = node[this._inverse];
				if (!inverseLink)
					throw Error('Inverse link "' + this._inverse +
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
	deserialize(data) {
		if (Array.isArray(data)) {
			this._references = [];
			for (let reference of data)
				this._references.push(reference);
		}
		else
			throw Error('Invalid data for: ' + this.id);
	}


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {
		return (this._references.length > 0) ? this.references : undefined;
	}
}


// --------------------------------------------------------------- METADATA

/** The type metadata of the NodeLink class. */
NodeLink.type = new NodeType('Link', 'link', null, NodeLink);


// ******************************************************* data\types\Simple.js





/** Defines a Simple data type. */
	   class Simple extends Node {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The value of the Simple data type. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the Simple data type. */ ;
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (this._value == newValue)
			return;
		this._value = newValue;
		this.updated = false;
	}


	/** The default value of the Simple data type. */
	get default() { return this._default; }
	set default(newDefault) {
		if (this._default == newDefault)
			return;
		this._default = newDefault;
		this.updated = false;
	}

	/** Indicates if the value is undefined. */
	get isUndefined() { return this._value == undefined; }


	/** Indicates if the value is the default. */
	get isDefault() {
		return this.default != undefined && this._value == this._default;
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Simple instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node.
	 * @param def The default value of the Simple data type. */
	constructor(name, parent, data, type = Node.type, def) {

		// Call the base class constructor
		super(name, parent, data, type);

		// Save the default value
		this._default = def;
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data) { this.value = data; }


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) { return this.value; }


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() {
		return (this.value != undefined) ? this.value.toString() : '(undefined)';
	}


	/** Obtains the value of the instance.
	 * @returns The value of the instance. */
	valueOf() { return this.value; }
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Simple class. */
Simple.type = new NodeType('Simple', 'simple', null, Simple);


// *********************************************** data\types\simple\Boolean.js






/** Defines a simple data type that stores a boolean value. */
	   class Boolean extends Simple {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Boolean node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value. */
	constructor(name, parent, data, def) {

		// Call the base class constructor
		super(name, parent, undefined, Boolean.type, def);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'boolean':
				this.value = (data == true);
				break;
			case 'number':
				this.value = data != 0;
				break;
			case 'string':
				this.value = (data.toLowerCase() == 'true');
				break;
			case 'object':
				super.deserialize(data);
				if (data.default != undefined)
					this.default = data.default;
				if (data.value != undefined)
					this.value = data.value;
				break;
			default:
				this.value = (data != 0);
				break;
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Boolean class. */
Boolean.type = new NodeType('Boolean', 'boolean', Node.type, Boolean);


// ************************************************ data\types\simple\Number.js





/** Defines a simple data type that stores a numeric value. */
	   class Number extends Simple {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The numeric value of the Number. */
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (this._value == newValue)
			return;
		if (this._min != undefined && newValue < this._min)
			throw Error('The minimum value for ' + this.id + ' is: ' + this._min);
		if (this._max != undefined && newValue > this._max)
			throw Error('The maximum value for ' + this.id + ' is: ' + this._max);
		this._value = newValue;
		this.updated = false;
	}


	/** The minimum value of the Number. */
	get min() { return this._min; }
	set min(newMin) {
		if (this._min == newMin)
			return;
		this._min = newMin;
		this.updated = false;
	}


	/** The maximum value of the Number. */
	get max() { return this._max; }
	set max(newMax) {
		if (this._max == newMax)
			return;
		this._max = newMax;
		this.updated = false;
	}


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
		super(name, parent, undefined, Number.type, def);

		// Set the default value
		if (min != undefined)
			this._min = min;
		if (max != undefined)
			this._max = max;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The initialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'boolean':
				this.value = (data == true) ? 1 : 0;
				break;
			case 'number':
				this.value = data;
				break;
			case 'string':
				this.value = parseFloat(data);
				break;
			case 'object':
				super.deserialize(data);
				if (data.min != undefined)
					this.min = data.min;
				if (data.max != undefined)
					this.max = data.max;
				if (data.default != undefined)
					this.default = data.default;
				if (data.value != undefined)
					this.value = data.value;
				break;
			default:
				this.value = parseFloat(data);
				break;
		}
	}


	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() {
		if (this._value == undefined)
			return '(undefined)';
		let value = this.value.toString();
		if (value.includes('.'))
			value = this.value.toFixed(5);

		return value;
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Number class. */
Number.type = new NodeType('Number', 'number', Node.type, Number);



// ************************************************ data\types\simple\String.js






/** Defines a simple data type that stores a textual value. */
	   class String extends Simple {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the String data type. */
	get value() {
		return (this._value != undefined) ? this._value : this.default;
	}
	set value(newValue) {
		if (this._value == newValue)
			return;
		if (this._options.length > 0 && !this._options.includes(newValue))
			throw ('Invalid value: "' + newValue + '" ' +
				' valid value are: "' + this._options.join('", ,"') + '"');
		this._value = newValue;
		this.updated = false;
	}

	/** The valid values of the String. */
	get options() { return this._options; }
	set options(newOptions) {
		if (!Array.isArray(newOptions))
			return;
		this._options = [];
		for (let newValidValue of newOptions)
			this._options.push(newValidValue);
	}


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the String node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param def The default value. */
	constructor(name, parent, data, def) {

		// Call the base class constructor
		super(name, parent, undefined, String.type, def);

		// Initialize the lis of valid values
		this._options = [];

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
	deserialize(data) {
		switch (typeof data) {
			case 'boolean':
				this.value = (data == true) ? 'true' : 'false';
				break;
			case 'number':
				this.value = data.toString();
				break;
			case 'string':
				this.value = data;
				break;
			case 'object':
				if (data.validValues != undefined)
					this.options = data.validValues;
				if (data.default != undefined)
					this.default = data.default;
				if (data.value != undefined)
					this.value = data.value;
				break;
			default:
				this.value = data.toString();
				break;
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the String class. */
String.type = new NodeType('String', 'string', Node.type, String);


// ****************************************************** data\types\Complex.js





/** Defines a Complex data type. */
	   class Complex extends Node {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Complex instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node.
	 * @param def The default values of the Complex data type. */
	constructor(name, parent, data, type = Node.type, def) {

		// Call the base class constructor
		super(name, parent, data, type);
	}

	// --------------------------------------------------------- PUBLIC METHODS


	/** Deserializes JSON data into the Complex instance.
	 * @param data The deserialization data. */
	deserialize(data) {
		let items = this.children, itemCount = items.length;
		if (Array.isArray(data)) {
			for (let valueIndex = 0; valueIndex < data.length; valueIndex++) {
				if (valueIndex > itemCount)
					break;
				items[valueIndex].deserialize(data[valueIndex]);
			}
		}
		else if (typeof data == 'object') {
			super.deserialize(data);
			for (let key in data) {
				if (!this._children[key])
					console.warn('Unknown child: "' + key + '" for: ' + this.id);
				this._children[key].deserialize(data[key]);
			}
		}
		else if (typeof data == 'number') {
			for (let item of items)
				item.deserialize(data);
		}
		else
			throw Error('Invalid values: "' + data + '" for:' + this.id);
	}


	/** Serializes the Complex instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {
		let result = [], items = this.children;
		for (let item of items) {
			if (item.isUndefined)
				break;
			result.push(item.value);
		}
		return result;
	}

	/** Obtains the string representation of the instance.
	 * @returns The string representation of the instance. */
	toString() {
		let valueStrings = [];
		for (let item of this) {
			let itemString = item.toString();
			if (itemString == '(undefined)')
				break;
			valueStrings.push(item.toString());
		}
		return '[' + valueStrings.join(', ') + ']';
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Complex class. */
Complex.type = new NodeType('Complex', 'complex', null, Complex);


// *********************************************** data\types\complex\Vector.js





/** Defines a generic three-dimensional vector. */
	   class Vector extends Complex {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The value of the Vector in the X axis. */ ;

	/** The value of the Vector in the Y axis. */ ;

	/** The value of the Vector in the Y axis. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The value of the Vector in the X axis. */ ;
	get x() { return this._x; }

	/** The value of the Vector in the Y axis. */ ;
	get y() { return this._y; }

	/** The value of the Vector in the Z axis. */ ;
	get z() { return this._z; }

	/** Indicates if the value is undefined. */
	get isUndefined() {
		return this._x.isUndefined && this._y.isUndefined && this._z.isUndefined;
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Vector node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, data);

		// Initialize the child nodes
		this._x = new Number('x', this, undefined, 0);
		this._y = new Number('y', this, undefined, 0);
		this._z = new Number('z', this, undefined, 0);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets the values of the Vector.
	 * @returns The values of the Vector. */
	getValues(x = 0, y = 0, z = 0) {
		return { x: this._x.value, y: this._y.value, z: this._z.value };
	}

	/** Sets the values of the Vector.
	 * @param x The value of the Vector in the X axis.
	 * @param y The value of the Vector in the Y axis.
	 * @param z The value of the Vector in the Z axis. */
	setValues(x = 0, y = 0, z = 0) {
		if (x != undefined)
			this._x.value = x;
		if (y != undefined)
			this._y.value = y;
		if (z != undefined)
			this._z.value = z;
	}

	/** Adds numeric values to the Vector.
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


	/** Subtracts numeric values to the Vector.
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


	/** Calculates the distance between two Vector instances.
	 * @param v1 The first Vector instance.
	 * @param v2 The second Vector instance.
	 * @returns Calculates the distance between the two Vector instances. */
	static distance(v1, v2) {
		let dx = (v1._x.value || 0) - (v2._x.value || 0), dy = (v1._y.value || 0) - (v2._y.value || 0), dz = (v1._z.value || 0) - (v2._z.value || 0);
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Vector class. */
Vector.type = new NodeType('Vector', 'vector', Complex.type, Vector);


// ************************************************ data\types\complex\Color.js






/** Defines an RGBA Color. */
	   class Color extends Complex {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The Red component of the Color. */ ;

	/** The Green component of the Color. */ ;

	/** The Blue component of the Color. */ ;

	/** The Alpha component of the Color. */ ;

	/** The text representation of the Color. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The Red component of the Color. */ ;
	get r() { return this._r; }

	/** The Green component of the Color. */ ;
	get g() { return this._g; }

	/** The Blue component of the Color. */ ;
	get b() { return this._b; }

	/** The Alpha component of the Color. */ ;
	get a() { return this._a; }

	/** The text representation of the Color. */ ;
	get text() { return this._text; }

	/** The hexadecimal value of the Color. */
	get hex() {
		let r = Math.floor(this._r.value * 255).toString(16).padStart(2, '0'), g = Math.floor(this._g.value * 255).toString(16).padStart(2, '0'), b = Math.floor(this._b.value * 255).toString(16).padStart(2, '0'), a = (this._a.value == 1) ? '' :
			Math.floor(this._a.value * 255).toString(16).padStart(2, '0');
		return '#' + r + g + b + a;
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
			throw Error('Invalid Hex value "' + v + '" for ' + this.id);
		}
	}

	/** Indicates if the Color is undefined. */
	get isUndefined() {
		return this._r.isUndefined && this._g.isUndefined
			&& this._b.isUndefined && this._a.isUndefined;
	}

	/** Indicates if the Color is default. */
	get isDefault() {
		return this._r.isDefault && this._g.isDefault
			&& this._b.isDefault && this._a.isDefault;
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Vector node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, data);

		// Initialize the child nodes
		this._r = new Number('r', this, undefined, 0);
		this._g = new Number('g', this, undefined, 0);
		this._b = new Number('b', this, undefined, 0);
		this._a = new Number('a', this, undefined, 1);
		this._text = new String('text', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Deserializes JSON data into the instance.
	 * @param data The deserialization data. */
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
				super.deserialize(data);
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
					'of type"' + dataType + '" for: ' + this.id);
		}
	}


	/** Serializes the instance to a JSON representation.
	 * @param params The serialization parameters.
	 * @returns The serialized data. */
	serialize(params = {}) {
		if (this.text.value)
			return this.text.value;
		let v = [this._r.value, this._g.value, this._b.value, this._a.value];
		if (v[0] == 0 && v[1] == 0 && v[2] == 0 && v[3] == 1)
			return undefined;
		if (v[3] == 1)
			v.pop();
		return v;
	}


	/** Serializes the instance to a string representation.
	 * @returns The string representation with the data of the instance. */
	toString() {
		if (this.text.value)
			return this.text.value;
		else
			return this.hex;
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
Color.type = new NodeType('Color', 'color', Complex.type, Color);


// ********************************************************* data\model\Item.js






/** Defines an item of a data model. */
	   class Item extends Node {


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the Item. */ ;

	/** The description of the Item. */ ;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the Item. */
	get title() { return this._title; }

	/** The description of the Item. */
	get description() { return this._description; }



	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes an Item node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name, parent, data, type = Item.type) {

		// Call the base class constructor
		super(name, parent, undefined, Item.type);

		// Initialize the child nodes
		this._title = new String('title', this);
		this._description = new String('description', this);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Item class. */
Item.type = new NodeType('Item', 'item', Node.type, Item);


// ************************************************* data\model\items\Domain.js






/** Defines a Domain of a data model. */
	   class Domain extends Item {


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


// ************************************************** data\model\items\Class.js










/** Defines a Class of a data model. */
	   class Class extends Item {


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


// *********************************************** data\model\items\Property.js





/** Defines a Property of a Class of a data model. */
	   class Property extends Item {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Instance node.
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


// ****************************************** data\model\items\ClassInstance.js








/** Defines a Class Instance of a data model. */
	   class ClassInstance extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The class of the ClassInstance. */
	get class() { return this._class; }

	/** The properties of the ClassInstance. */
	get properties() { return this._properties; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a ClassInstance node.
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
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the ClassInstance class. */
ClassInstance.type = new NodeType('ClassInstance', 'class_instance', Item.type, ClassInstance);


// *********************************************** data\model\items\Relation.js









/** Defines a Relation of a data model. */
	   class Relation extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The parent relation of the Relation. */
	get extends() { return this._extends; }

	/** The classes of the Relation. */
	get classes() { return this._classes; }

	/** The instances of the Relation. */
	get instances() { return this._instances; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Relation node.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent, undefined, Relation.type);

		// Initialize the child nodes
		let model = this.ancestor(Model);
		this._extends = new NodeLink('extends', this, undefined, model ? model.relations : undefined);
		this._classes = new NodeLink('classes', this, undefined, model ? model.classes : undefined, 'relations');
		this._instances = new NodeSet('instances', this, RelationInstance.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Relation class. */
Relation.type = new NodeType('Relation', 'relation', Item.type, Relation);



// *************************************** data\model\items\RelationInstance.js






/** Defines a RelationInstance of a data model. */
	   class RelationInstance extends Item {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The relation of the RelationInstance. */
	get relation() { return this._relation; }

	/** The origin of the RelationInstance. */
	get origin() { return this._origin; }

	/** The target of the RelationInstance. */
	get target() { return this._target; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a RelationInstance node.
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
}


// --------------------------------------------------------------- METADATA

/** The type metadata of the RelationInstance class. */
RelationInstance.type = new NodeType('RelationInstance', 'relation_instance', Item.type, RelationInstance);


// ******************************************************** data\model\Model.js









/** Defines a data Model. */
	   class Model extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The list of domains of the Model. */
	get domains() { return this._domains; }

	/** The list of classes of the Model. */
	get classes() { return this._classes; }

	/** The list of relations of the Model. */
	get relations() { return this._relations; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a Model instance.
	 * @param name The node name.
	 * @param parent The parent node.
	 * @param data The initialization data. */
	constructor(name, parent, data) {

		// Call the base class constructor
		super(name, parent);

		// Initialize the child nodes
		this._domains = new NodeSet('domains', this, Domain.type);
		this._classes = new NodeSet('classes', this, Class.type);
		this._relations = new NodeSet('relations', this, Relation.type);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Node class. */
Model.type = new NodeType('Model', 'model', Node.type, Model);


// ********************************************************** view\Animation.js





/** A list of easing functions. */
	   class Easing {

	/* Linear Easing. */
	static linear(t) { return t; }

	/* Quadratic Easing. */
	static quadratic(t) { return t * t; }

	/* Cubic Easing. */
	static cubic(t) { return t * t * t; }
}

/** Defines a simple Animation. */
	   class Animation {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Animation instance.
	 * @param target The target of the Animation (a Component or a Node).
	 * @param property The property to animate (if the target is a Component).
	 * @param startValue The stating value of the Animation.
	 * @param endValue The ending value of the Animation.
	 * @param startTime The stating time of the Animation.
	 * @param endTime The ending time of the Animation.
	 * @param easing The easing function of the Animation. */
	constructor(target, property, startValue, endValue, startTime = 0, endTime = 1, autoplay = true, easing = Easing.quadratic) {

		// Ensure that no animation operate in NodeJs
		if (KnowledgeGraph.environment == 'node')
			return;

		// Save the given parameters
		this._target = target;
		this._property = property;
		this._startValue = startValue;
		this._endValue = endValue;
		this._startTime = startTime;
		this._endTime = endTime;
		this._autoplay = autoplay;
		this._easing = easing;

		// If the autoplay option is active, start playing the animation.
		if (autoplay)
			this.play();
	}


	/** Plays the Animation. */
	play(times = 1, reverse = false) {
		this._previousTime = undefined;

		this._reverse = reverse;

		// Starts the update process
		this.update(document.timeline.currentTime.valueOf());

	}


	/** Updates the Animation.
	 * @param time The current time of the document timeline.*/
	update(time) {
		time /= 1000; // Convert the time to seconds
		if (this._previousTime == undefined)
			this._currentTime = -this._startTime;
		else
			this._currentTime += time - this._previousTime;
		this._previousTime = time;

		// Calculate the interpolation variable [0-1]
		let interpolation = 0, duration = this._endTime - this._startTime, value, difference = this._endValue - this._startValue;
		if (this._currentTime <= 0)
			interpolation = 0;
		else if (this._currentTime < duration) {
			interpolation = (this._currentTime / duration);
			if (this._easing)
				interpolation = this._easing(interpolation);
		}
		else
			interpolation = 1;

		// If the animation is reversed, invert the interpolation variable
		if (this._reverse)
			interpolation = 1 - interpolation;

		// Calculate the interpolated value
		value = this._startValue + difference * interpolation;

		// Apply the interpolation 
		if (typeof this._target == 'function')
			this._target(interpolation, value);
		else if (this._property != undefined)
			this._target.setAttribute(this._property, value);

		// Continue until the animation is finished
		if (this._currentTime < this._endTime)
			requestAnimationFrame(this.update.bind(this));
	}
}



// ********************************************************** view\Component.js




/** Creates a visual component (that can be directly be serialized to SVG). */
	   class Component {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The tag of the Component. */
	get tag() { return this._tag; }

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

	get enabled() { return this._enabled; }
	set enabled(e) {
		this._element.setAttribute('visibility', e ? 'visible' : 'hidden');
		this._enabled = e;
	}

	/** The encapsulated SVG element. */
	get element() { return this._element; }

	/** The parent Component instance. */
	get parent() { return this._parent; }

	/** The child Component instances. */
	get children() { return this._children; }

	/** The animations of the Component. */
	get animations() { return this._animations; }



	/** The handler for click events. */
	get onclick() { return this._onclick; }
	set onclick(listener) {
		if (KnowledgeGraph.environment != 'browser')
			return;
		this._onclick = listener;
		this._element.addEventListener('click', listener);
	}

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the Component instance.
	 * @param tag The SVG tag of the Component.
	 * @param parent parent Component instance.
	 * @param attributes The SVG attributes of the Component.
	 * @param content The SVG content of the Component.
	 * @param onclick The handler for click events of the Component. */
	constructor(tag, parent, attributes, content, onclick) {

		// Set the tag, attributes and content of the component
		if (tag)
			this._tag = tag;
		else
			throw Error('Invalid SVG tag');

		// If possible, create the SVG element with the "document" instance
		if (KnowledgeGraph.environment == 'browser') {
			if (attributes && attributes.id)
				this._element =
					document.getElementById(attributes.id);
			if (!this._element)
				this._element = document.createElementNS('http://www.w3.org/2000/svg', tag);
			if (parent)
				parent._element.appendChild(this._element);
		}

		// Set the attributes
		this._attributes = {};
		let a = attributes;
		if (attributes != undefined && typeof attributes == 'object') {
			for (let key in attributes)
				this.setAttribute(key, attributes[key]);
		}

		// Create the list of animations
		this._animations = {};

		// Set the content
		if (content)
			this.content = content;
		else
			this._content = '';

		// Set the handler for click events
		if (onclick)
			this.onclick = onclick;

		// Set the parent-child relationship
		this._parent = parent;
		this._children = [];
		if (parent != undefined)
			parent._children.push(this);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets the value of an attribute.
	 * @param name The name of the attribute.
	 * @returns The value of the attribute. */
	getAttribute(name) { return this._attributes[name]; }


	/** Sets the value of an attribute.
	 * @param name The name of the attribute.
	 * @param value The new value of the attribute. */
	setAttribute(name, value) {
		if (typeof value == 'number')
			value = Component.serializeNumber(value);
		if (name.indexOf('_') >= 0)
			name = name.replace(/_/g, '-');
		this._attributes[name] = value;
		if (this._element) {
			if (value != undefined)
				this._element.setAttribute(name, value);
			else
				this._element.removeAttribute(name);
		}
	}

	/** Brings the component to the front. */
	bringToFront() {
		if (this._element && this._element.parentNode) {
			if (!this._element.nextElementSibling)
				return;
			let parentElement = this._element.parentNode;
			parentElement.removeChild(this._element);
			parentElement.appendChild(this._element);
		}
	}

	/** Clears the component. */
	clear() {
		for (let child of this._children)
			child._element.remove();
		this._children = [];
	}

	// --------------------------------------------------------- PUBLIC METHODS

	/** Serializes a number to a string representation.
	 * @param value The numeric value to serialize.
	 * @returns The string with the numeric value. */
	static serializeNumber(value) {
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


	/** Serializes the Component to its SVG representation.
	 * @param tabLevel The tabulation level.
	 * @returns The SVG representation of the Component (as lines). */
	toString(tabLevel = 0) {

		// Create the start tag
		let result = '\t'.repeat(tabLevel) + '<' + this.tag;

		// Add the attributes to the start tag
		for (let key in this._attributes)
			result += ' ' + key + '="' + this._attributes[key] + '"';

		// If there is any content, add it and return the result
		if (this._content)
			return result + '>' + this._content + '</' + this.tag + '>';

		// If there are no children, close the start tag and return the result
		if (this._children.length == 0)
			return result + '/>';

		// Create the list of children and finish with an end tag
		result += '>';
		for (let child of this._children)
			result += '\n' + child.toString(tabLevel + 1);
		return result + '\n' + '\t'.repeat(tabLevel) + '</' + this.tag + '>';
	}
}


// ************************************************************* view\Widget.js












/** Defines a basic interactive Widget */
	   class Widget extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** Indicates whether the widget is enabled or not. */
	get enabled() { return this._enabled; }
	set enabled(e) { this._enabled = e; }

	/** The main component of the widget. */
	get component() { return this._component; }

	/** The width of the widget. */
	get width() { return this._width; }

	/** The height of the widget. */
	get height() { return this._height; }

	/** The anchor of the widget. */
	get anchor() { return this._anchor; }

	/** The pivot of the widget. */
	get pivot() { return this._pivot; }

	/** The position of the widget. */
	get position() { return this._position; }

	/** The scale of the widget. */
	get scale() { return this._scale; }

	/** The children of the Widget. */
	get widgets() { return this._widgets; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Widget instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param data The initialization data.
	 * @param type The type of the node. */
	constructor(name, parent, data, type = Widget.type) {

		// Call the parent constructor
		super(name, parent, data, type);

		// Initialize the child nodes
		this._width = new Number('width', this, undefined, 0);
		this._height = new Number('height', this, undefined, 0);
		this._anchor = new String('anchor', this, { validValues: Widget.anchorValues, default: 'top-left' });
		this._pivot = new String('pivot', this, { validValues: Widget.pivotValues, default: 'top-left' });
		this._position = new Vector('position', this);
		this._scale = new Number('scale', this, undefined, 1, 0.1, 10);
		this._widgets = new NodeSet('widgets', this, Widget.type);
		this._backgroundColor = new Color('background', this, 'none');
		this._backgroundRadius = new Number('radius', this, 0);

		// Get the parent component
		let node = this.parent;
		while (node) {
			let component = node.component;
			if (component) {
				this._parentComponent = component;
				break;
			}
			node = node.parent;
		}
		if (!this._parentComponent)
			throw Error('No parent component for: ' + this.id);

		// Create the main component and the background in it
		this._component = new Component('g', this._parentComponent, { id: this.name });
		this._backgroundComponent = new Component('rect', this._component, { fill: 'none' });

		// Set the properties of the widget
		this._enabled = true;
		this._dragEvents = false;

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// The size of the UI is initially defined by the user interface
		let ui = this.ancestor(UserInterface);
		this.resize(ui.width.value, ui.height.value);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Widget instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced)
			return;

		// Get the position variable
		let position = this.position.getValues(), scale = this._scale.value, x = position.x, y = position.y, w = this._width.value || 0, h = this._height.value || 0;

		// If there is a pivot, calculate the offset
		this._offSetX = 0;
		this._offSetY = 0;
		switch (this._pivot.value) {
			case 'top':
			case 'center':
			case 'bottom':
				this._offSetX = w / 2;
				break;
			case 'top-right':
			case 'right':
			case 'bottom-right':
				this._offSetX = w;
				break;
		}
		switch (this._pivot.value) {
			case 'left':
			case 'center':
			case 'right':
				this._offSetY = h / 2;
				break;
			case 'bottom-left':
			case 'bottom':
			case 'bottom-right':
				this._offSetY = h;
				break;
		}
		if (this._offSetX != 0)
			x += this._offSetX;
		if (this._offSetY != 0)
			y += this._offSetY;

		// If there is an anchor, user to the parent widget properties
		if (!this._anchor.isDefault) {
			let p = this.ancestor(Widget), pw = 0, ph = 0;
			if (p) {
				pw = p.width.value;
				ph = p.height.value;
				x -= p._offSetX;
				y -= p._offSetY;
			}

			switch (this._anchor.value) {
				case 'top':
				case 'center':
				case 'bottom':
					x += (pw - w) / 2;
					break;
				case 'top-right':
				case 'right':
				case 'bottom-right':
					x += pw - w;
					break;
			}
			switch (this._anchor.value) {
				case 'left':
				case 'center':
				case 'right':
					y += (ph - h) / 2;
					break;
				case 'bottom-left':
				case 'bottom':
				case 'bottom-right':
					y += ph - h;
					break;
			}
			if (this._anchor.value == 'movable') {
				if (!this._dragEvents)
					this.enableDragEvents();
			}
		}

		// Adjust the transform property with the position and scale
		if (x == 0 && y == 0 && scale == 1)
			this._component.setAttribute('transform', undefined);
		else
			this._component.setAttribute('transform', ((x != 0 || y != 0) ? 'translate(' + x + ' ' + y + ')' : '') + ' ' +
				(scale != 1 ? 'scale(' + Component.serializeNumber(scale) + ') ' : ''));

		// Adjust the background component
		if (this._offSetX != 0 || this._offSetY != 0) {
			this._backgroundComponent.setAttribute('x', -this._offSetX);
			this._backgroundComponent.setAttribute('y', -this._offSetY);
		}
		this._backgroundComponent.setAttribute('width', w);
		this._backgroundComponent.setAttribute('height', h);
		if (!this._backgroundColor.isDefault) {
			this._backgroundComponent.setAttribute('fill', this._backgroundColor.toString());
		}
		else
			this._backgroundComponent.setAttribute('fill', 'none');
		if (!this._backgroundRadius.isDefault) {
			this._backgroundComponent.setAttribute('rx', this._backgroundRadius.toString());
			this._backgroundComponent.setAttribute('ry', this._backgroundRadius.toString());
		}
		else {
			this._backgroundComponent.setAttribute('rx', undefined);
			this._backgroundComponent.setAttribute('ry', undefined);
		}

		// Call the base class method
		return super.update();
	}


	/** Resizes the Widget instance.
	 * @param width The width of the view.
	 * @param height The height of the view. */
	resize(width, height) {

		// If there is already a value, preserve it
		if (!this._width.isUndefined)
			width = this._width.value;
		if (!this._height.isUndefined)
			height = this._height.value;

		this._component.width = width;
		this._component.height = height;
		this._width.default = width;
		this._height.default = height;


		// Resize the child widgets
		for (let child of this.widgets)
			child.resize(width, height);

		// Request the widget to be updated in any case
		this.updated = false;

		let x1 = 0, x2 = width, y1 = 0, y2 = height;
		switch (this._pivot.value) {
			case 'top':
			case 'center':
			case 'bottom':
				x1 -= width / 2;
				x2 -= width / 2;
				break;
			case 'top-right':
			case 'right':
			case 'bottom-right':
				x1 -= width;
				x2 -= width;
				break;
		}
		switch (this._pivot.value) {
			case 'left':
			case 'center':
			case 'right':
				y1 -= height / 2;
				y2 -= height / 2;
				break;
			case 'bottom-left':
			case 'bottom':
			case 'bottom-right':
				y1 -= height;
				y2 -= height;
				break;
		}

		// In the debug mode, create a grid
		if (this.debug) {
			let cellSize = 100;
			if (!this._debugComponent)
				this._debugComponent = new Component('g', this._component, { id: 'debug', fill: 'none' });
			this._debugComponent.clear();
			new Component('rect', this._debugComponent, { x: x1, y: y1,
				width: width, height: height, stroke: 'grey' });
			let x1c = Math.ceil(x1 / cellSize) * cellSize, x2c = Math.floor(x2 / cellSize) * cellSize, y1c = Math.ceil(y1 / cellSize) * cellSize, y2c = Math.floor(y2 / cellSize) * cellSize;
			for (let x = x1c; x <= x2c; x += cellSize)
				new Component('line', this._debugComponent, { y1: y1, y2: y2,
					x1: x, x2: x, stroke: x == 0 ? 'green' : 'grey' });
			for (let y = y1c; y <= y2c; y += cellSize)
				new Component('line', this._debugComponent, { x1: x1, x2: x2,
					y1: y, y2: y, stroke: y == 0 ? 'red' : 'grey' });

			console.log('Resized ' + this.id + ': ' + width + ' x ' + height);
		}
	}

	/** Enables the events for mobile anchors. */
	enableDragEvents() {
		let ui = this.ancestor(UserInterface);
		let element = ui.component.element;
		if (!element)
			return;
		element.addEventListener('mousedown', (e) => {
			this.react('down', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		window.addEventListener('mousemove', (e) => {
			this.react('move', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		element.addEventListener('mouseup', (e) => {
			this.react('up', e.buttons, e.offsetX, e.offsetY, e.movementX, e.movementY);
			e.preventDefault();
		});
		element.addEventListener('wheel', (e) => {
			this.react('zoom', e.buttons, e.pageX - element.clientLeft, e.pageY - element.clientTop, e.movementX, e.movementY, e.deltaY < 0 ? 0.1 : -0.1);
			e.preventDefault();
		});

		// Create multi-touch system
		let cursorX = 0, cursorY = 0, maxTouches = 0;
		element.addEventListener('touchstart', (e) => {
			let touch = e.touches[0], touchCount = e.touches.length;
			cursorX = touch.clientX;
			cursorY = touch.clientY;
			this.react('down', touchCount, cursorX, cursorY);
			maxTouches = touchCount;
		});
		element.addEventListener('touchend', (e) => {
			let touch = e.touches[0], touchCount = e.touches.length, mx = touch.clientX - cursorX, my = touch.clientY - cursorY;
			cursorX = touch.clientX;
			cursorY = touch.clientY;
			this.react('up', touchCount, cursorX, cursorY, mx, my);
		});
		let touchSeparation = undefined;
		element.addEventListener('touchmove', (e) => {
			if (e.touches.length < 2) {
				let touch = e.touches[0], touchCount = e.touches.length, mx = touch.clientX - cursorX, my = touch.clientY - cursorY;
				cursorX = touch.clientX;
				cursorY = touch.clientY;

				this.react('move', touchCount, cursorX, cursorY, mx, my);
				e.preventDefault();
			}
			else {
				let dx = e.touches[1].pageX - e.touches[0].pageX, dy = e.touches[1].pageY - e.touches[0].pageY, s = Math.sqrt(dx * dx + dy * dy) / 100, x = e.touches[1].pageX - element.clientLeft - dx / 2, y = e.touches[1].pageY - element.clientTop - dy / 2;
				if (touchSeparation != undefined)
					this.react('zoom', 0, x, y, 0, 0, s - touchSeparation);
				touchSeparation = s;
			}
		});
		element.addEventListener('touchend', (e) => {
			touchSeparation = undefined;
		});

		this._dragEvents = true;
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

		if (!this._enabled)
			return;
		if (action == 'move') {
			if (button > 0)
				this._position.addValues(mx, my);
			return;
		}
		if (action == 'zoom') {
			// Prevent the zoom from being 0 or too 
			let oldZoom = this._scale.value, newZoom = this._scale.value + mz;
			if (newZoom < this._scale.min)
				newZoom = this._scale.min;
			else if (newZoom > this._scale.max)
				newZoom = this._scale.max;
			this._scale.value = newZoom;

			// Calculate the relative target
			let relX = -(this._position.x.value + this._offSetX), relY = -(this._position.y.value + this._offSetY);

			// Get the old and new targets in the 2D space
			let oldX = (x + relX) * oldZoom, oldY = (y + relY) * oldZoom, newX = (x + relX) * newZoom, newY = (y + relY) * newZoom;

			// Update the values of the view and re-target it
			this._position.x.value += (oldX - newX) / oldZoom;
			this._position.y.value += (oldY - newY) / oldZoom;
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Node class. */
Widget.type = new NodeType('Widget', 'widget', Node.type, Widget);


// --------------------------------------------------------------- METADATA

/** The valid values for the anchor property. */
Widget.anchorValues = ['top-left', 'top', 'top-right', 'left', 'center',
	'right', 'bottom-left', 'bottom', 'bottom-right', 'movable'];


/** The valid values for the pivot property. */
Widget.pivotValues = ['top-left', 'top', 'top-right', 'left', 'center',
	'right', 'bottom-left', 'bottom', 'bottom-right'];


// ****************************************************** view\UserInterface.js













/** Defines a User Interface to handle the interaction with the users. */
	   class UserInterface extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The main component of the UserInterface. */
	get component() { return this._component; }

	/** The background of the UserInterface. */
	get background() { return this._background; }

	/** The background color of the UserInterface. */
	get color() { return this._color; }

	/** The resources of the UserInterface. */
	get resources() { return this._resources; }

	/** The layers of the UserInterface. */
	get layers() { return this._layers; }

	/** The width of the UserInterface. */
	get width() { return this._width; }

	/** The height of the UserInterface. */
	get height() { return this._height; }

	/** The ViewReset event handler. */
	get onViewReset() { return this._onViewReset; }

	/** The style the UserInterface. */
	get style() { return this._style; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Interface instance.
	 * @param parent The app reference.
	 * @param data The data of the app. */
	constructor(name, parent, data = {}) {

		// Call the parent class constructor
		super(name, parent, data);

		// Initialize the child nodes
		this._width = new Number('width', this, 2970);
		this._height = new Number('height', this, 2100);
		this._color = new Color('color', this, 'url(#background_color)');
		this._style = new String('style', this, 'dark');
		this._resources = new NodeSet('resources', this, String.type);
		this._layers = new NodeSet('layers', this, Widget.type);

		let width = this._width.value, height = this._height.value, color = this.color.toString(), unitType = 'mm';

		// If no SVG element was specified, create one
		if (!this._component) {
			let name = parent.title.value;
			this._component = new Component('svg', undefined, { id: name,
				xmlns: 'http://www.w3.org/2000/svg', version: "1.1",
				"xmlns:xlink": "http://www.w3.org/1999/xlink",
				width: (width / 10) + unitType, height: (height / 10) + unitType,
				viewBox: '0 0 ' + width + ' ' + height
			});
		}

		// Create a system to handle the resizing
		if (KnowledgeGraph.environment == 'browser') {
			// Remove any existing elements except scripts
			let element = this._component.element, children = element.childNodes, childIndex = 0, childCount = children.length;
			for (childIndex = 0; childIndex < childCount; childIndex++) {
				let child = children.item(childIndex);
				if (child.nodeType != child.ELEMENT_NODE ||
					!(child.tagName == 'defs' ||
						child.tagName == 'script')) {
					this._component.element.removeChild(child);
					childIndex--;
					childCount--;
				}
			}


			// Add the element to the browser
			let parentElement = data.element || document.body;
			if (KnowledgeGraph.environment == 'browser' && !parentElement) {
				// Set the style of the element
				this._width.value = window.innerWidth;
				this._height.value = window.innerHeight;
				console.log(this._width.value, this._height.value);
			}
			else {
				this._width.value = parentElement.clientWidth;
				this._height.value = parentElement.clientHeight;
				parentElement.append(element);
			}
			this._component.setAttribute('style', 'position: fixed; ' +
				'top: 0; left: 0; width:100%; height:100%; user-select: none;');
		}

		// Initialize the ViewReset event handler
		this._onViewReset = [];

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);

		// Create the definitions
		this._definitions = new Component('defs', this._component);

		// Create the colors
		let style = this._style.value =
			(KnowledgeGraph.environment == 'browser') ? 'dark' : 'light', black = '#111111', white = '#FFFFFF', color1 = style == 'light' ? white : black, color2 = style == 'light' ? black : white;
		let background_color = new Component('linearGradient', this._definitions, { id: 'background_color' });
		new Component('stop', background_color, { 'stop-color': color1, 'stop-opacity': 1 });
		let foreground_color = new Component('linearGradient', this._definitions, { id: 'foreground_color' });
		new Component('stop', foreground_color, {
			'stop-color': color2, 'stop-opacity': 1
		});
		this.style.updated = true;


		// Create the basic components of the user interface;
		this._background = new Component('rect', this._component, {
			id: "background", width: width, height: height,
			fill: "url(#background_color)"
		});


		// Resize the view
		this.resize();

		// Handle the browser events
		if (KnowledgeGraph.environment == 'browser') {
			// Resize the user interface whenever necessary
			window.addEventListener('resize', this.resize.bind(this));
			this._component.element.addEventListener('resize', this.resize.bind(this));

			// Disable the right click menu
			window.oncontextmenu = (e) => { e.preventDefault(); };
		}
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Node instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// Update the color of the background
		if (!this._color.updated)
			this._background.setAttribute('fill', this._color.toString());

		// Update the style
		if (!this._style.updated) {
			// Create the colors to switch to
			let black = new Color('black', undefined, [0.0, 0.0, 0.0]), white = new Color('white', undefined, [1.0, 1.0, 1.0]), foregroundNode = this._definitions.children[0].children[0], backgroundNode = this._definitions.children[1].children[0];
			let color1, color2;
			switch (this._style.value) {
				case "light":
					color1 = white;
					color2 = black;
					break;
				case "dark":
					color1 = black;
					color2 = white;
					break;
			}
			// Animate the transition between colors
			// if (KnowledgeGraph.environment == 'browser') {
			new Animation((t) => {

				let c1 = Color.interpolate(color2, color1, t).hex, c2 = Color.interpolate(color1, color2, t).hex;
				foregroundNode.setAttribute('stop-color', c1);
				backgroundNode.setAttribute('stop-color', c2);
				console.log(c1);
			}, undefined, 0, 1, 0, 0.2, true);

			if (this.debug)
				console.log('Switched style to: ' + this._style.value);
		}

		if (!this._resources.updated)
			for (let resource of this._resources)
				new Component('g', this._definitions, { id: resource.name }, resource.value);

		// Call the base class method
		super.update();

		// Request a new update as soon as possible 
		if (KnowledgeGraph.environment == 'browser') {
			requestAnimationFrame(this.update.bind(this));
			return false;
		}
	}


	/** Resizes the user interface. */
	resize() {
		// In NodeJS, it doesn't make sense to modify the size of the SVG
		if (KnowledgeGraph.environment == 'node') {
			for (let layer of this._layers)
				if (layer.enabled)
					layer.resize(2970, 2100);
			return;
		}

		// Take advantage of the CSS styling to update the size of the SVG
		let element = this._component.element, width = element.clientWidth, height = element.clientHeight;
		this.width.value = width;
		this.height.value = height;
		this._component.width = width;
		this._component.height = height;
		this._component.setAttribute('width', width);
		this._component.setAttribute('height', height);
		this._component.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		this._background.setAttribute('width', width);
		this._background.setAttribute('height', height);

		// Show a message on console
		if (this.debug)
			console.log("Resized: " + width + ' x ' + height);

		// Resize the layers
		for (let layer of this._layers)
			if (layer.enabled)
				layer.resize(width, height);

		// Update the user interface
		this.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the UserInterface class. */
UserInterface.type = new NodeType('UserInterface', 'ui', Node.type, UserInterface);



// **************************************************** view\widgets\Graphic.js







/** Defines a Graphic Widget */
	   class Graphic extends Widget {


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


// ******************************************************* view\widgets\Text.js









/** Defines a Text Widget */
	   class Text extends Widget {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The text string of the Text. */
	get text() { return this._text; }

	/** The font name string of the Text. */
	get font() { return this._font; }

	/** The font name string of the Text. */
	get align() { return this._align; }

	/** The font size of the Text. */
	get size() { return this._size; }

	/** The color of the Text. */
	get color() { return this._color; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Text instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, undefined, Text.type);

		// Initialize the child nodes
		this._text = new String('text', this, undefined, '<text>');
		this._font = new String('font', this, undefined, 'Arial');
		this._align = new String('align', this, {
			validValues: ['right', 'center', 'left']
		}, 'right');
		this._size = new Number('size', this, undefined, 15);
		this._color = new Color('color', this, 'url(#foreground_color)');

		// Create the component of the text
		this._textComponent = new Component('text', this._component);

		// Deserialize the initialization data
		if (data != undefined)
			this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Text instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced)
			return;

		// Update the text component
		let c = this._textComponent;
		if (!this._text.updated)
			c.content = this._text.value;
		if (!this._font.updated)
			c.setAttribute('font_family', this._font.value);
		if (!this._size.updated)
			c.setAttribute('font_size', this._size.value);
		if (!this.color.updated)
			c.setAttribute('fill', this.color.toString());

		// Call the base class method
		return super.update();
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Text class. */
Text.type = new NodeType('Text', 'text', Widget.type, Text);


// ************************************************* view\widgets\TransitMap.js









/** Defines a TransitMap Widget */
	   class TransitMap extends Widget {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new SwitchWidget instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, data);

		// Create the map 
		this._map = new Widget('map', this.widgets);
		let c = this._map.component;
		this._districtsElement = new Component('g', c, { id: 'districts' });
		this._connectionsElement = new Component('g', c, { id: 'connections' });
		this._stationsElement = new Component('g', c, { id: 'stations' });
		this._infoElement = new Component('g', c, { id: 'info' });
		this._map.pivot.value = 'center';
		this._map.anchor.value = 'movable';

		// Create the legends
		let width = this._width.value, height = this._height.value, vmin = width < height ? width : height, legendSize = vmin / 10, fontFamily = 'arial';
		this._linesLegend = new Widget('LinesLegend', this.widgets, {
			width: legendSize, height: legendSize, anchor: 'bottom-left',
			position: [10, -10], background: '#88888844', radius: 10
		});
		new Component('text', this._linesLegend.component, {
			id: 'LinesLegendTitle', x: 10, y: 20, font_family: fontFamily,
			font_size: 15, font_weight: "bold",
			fill: 'url(#foreground_color)'
		}, 'Lines (Stakeholders):');
		this._linesLegendItems = new Component('g', this._linesLegend.component);
		this._districtsLegend = new Widget('DistrictsLegend', this.widgets, {
			width: legendSize, height: legendSize, anchor: 'bottom-right',
			position: [-10, -10], background: '#88888844', radius: 10
		});
		new Component('text', this._districtsLegend.component, {
			id: 'DistrictsLegendTitle', x: 10, y: 20, font_family: fontFamily,
			font_size: 15, font_weight: "bold",
			fill: 'url(#foreground_color)'
		}, 'Districts (Domains):');
		this._districtsLegendItems = new Component('g', this._districtsLegend.component);

		// Connect the reset view event
		let ui = this.ancestor(UserInterface);
		ui.onViewReset.push(this.resetView.bind(this));
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the TransitMapView instance.
	 * @param forced Whether to force the update or not. */
	update(forced = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced)
			return;

		// Get the model of the KnowledgeGraph
		let model = this.ancestor(KnowledgeGraph).model;
		let fontFamily = 'Arial';

		// If the model has not been updated, skip the creation of 
		if (forced || !this._updateTime || this._updateTime <= model.updateTime) {

			// Clean the current elements
			this._districtsElement.clear();
			this._connectionsElement.clear();
			this._stationsElement.clear();
			this._infoElement.clear();

			// Create the data structures
			this._districts = {};
			this._districtsList = [];
			this._stations = {};
			this._stationsList = [];
			this._connections = {};
			this._connectionsList = [];

			// Convert the domains into districts
			let districtIndex = 0, districtColors = ['#ef1de5', '#037e8e',
				'#00abcd', '#620d7d', '#b206f9', '#082ebf', '#C999D3', '#F2E6F4',
				'#EBB3F3', '#F8E6FB', '#B3C3D4', '#E6EBF1', '#BFFBFF', '#EAFEFF'];

			for (let d of model.domains) {
				let district = { name: d.name, title: d.title.value,
					description: d.description.value, stations: [],
					color: districtColors[districtIndex] };
				district.element = new Component('path', this._districtsElement, { id: district.name,
					fill: district.color, fill_opacity: 0.4 });
				for (let c of d.classes)
					district.stations.push(c.name);
				this._districts[district.name] = district;
				this._districtsList.push(district);

				// Increase the counter
				districtIndex++;
			}

			// Convert the classes into stations
			for (let c of model.classes) {
				let station = { name: c.name, title: c.title.value,
					description: c.description.value, lines: [], districts: [],
					connections: {}, x: 1000, y: 1000, visible: true };
				for (let lineName of c.relations.references)
					station.lines.push(lineName);
				for (let district of c.domains.references)
					station.districts.push(district);
				// if (station.districts.length > 1)
				// 	console.log(station.name, station.districts)

				// Create the station group element
				station.element = new Component('g', this._stationsElement, {
					id: station.name
				});

				// The main element is a circle
				new Component('circle', station.element, {
					r: 10, stroke: 'url(#foreground_color)', stroke_width: '2',
					fill: 'url(#background_color)'
				});

				// Create a label with a shadow
				let text = station.title, lines = text.split('\n'), fontSize = 10, lineSeparation = 15, lineOffset = -5 - lineSeparation * lines.length;
				let labelShadow = new Component('text', station.element, {
					font_family: fontFamily, font_size: fontSize,
					font_weight: "bold", text_anchor: "middle",
					stroke: 'url(#background_color)', stroke_width: 2
				});
				let label = new Component('text', station.element, {
					font_family: fontFamily, font_size: fontSize,
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#foreground_color)'
				});
				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					let tp = { x: 0, y: lineOffset }, line = lines[lineIndex];
					new Component('tspan', labelShadow, tp, line);
					new Component('tspan', label, tp, line);
					lineOffset += lineSeparation;
				}

				// Create the element with the information of the station
				station.infoElement = new Component('g', this._infoElement);
				if (KnowledgeGraph.environment == 'node')
					station.infoElement.setAttribute('display', 'none');
				let w = 200, r = 10;
				text = station.description;
				lines = text.split('\n');
				lineOffset = 15;
				new Component('rect', station.infoElement, {
					x: -w / 2, y: 0, width: w, height: w / 2, rx: r, ry: r,
					font_family: fontFamily, font_size: fontSize,
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#background_color)',
					stroke: 'url(#foreground_color)', stroke_width: 2
				});
				let description = new Component('text', station.infoElement, {
					font_family: fontFamily, font_size: fontSize,
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#foreground_color)'
				});
				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					let tp = { x: 0, y: lineOffset }, line = lines[lineIndex];
					new Component('tspan', description, tp, line);
					lineOffset += lineSeparation;
				}

				// Create an event
				if (KnowledgeGraph.environment == 'browser') {
					let e = station.infoElement;
					e.enabled = false;
					e.onclick = station.element.onclick = () => {
						e.enabled = !e.enabled;
						if (e.enabled)
							console.log(station);
					};
				}

				// Add the element to the lists
				this._stations[station.name] = station;
				this._stationsList.push(station);
			}
			this._stationsList.sort((a, b) => b.lines.length - a.lines.length);
			// console.log('Sorted stations:', this._stationsList);

			// Convert the relationship into lines
			let lineIndex = 0, lineColors = ['#ef1de5', '#037e8e', '#00abcd',
				'#620d7d', '#b206f9', '#082ebf', '#a59dcc', '#582bb1'], lineWidths = [2, 2, 2, 2, 2, 2, 2, 2];
			this._lines = {};
			this._linesList = [];
			for (let relation of model.relations) {
				let line = { name: relation.name,
					title: relation.title.value,
					description: relation.description.value,
					color: lineColors[lineIndex],
					stations: [], connections: [],
					width: lineWidths[lineIndex], circular: false
				};
				for (let stationName of relation.classes.references)
					line.stations.push(stationName);
				line.stations.sort((a, b) => this._stations[b]
					.lines.length - this._stations[a].lines.length);
				this._lines[relation.name] = line;
				this._linesList.push(line);

				// Create the legends


				// Increase the counter
				lineIndex++;
			}
			this._linesList.sort((a, b) => b.stations.length - a.stations.length);
			// console.log('Sorted lines:', this._linesList);

			// Update the legends
			this.updateLegends();

			// DEBUG position the stations in a simpler grid
			// this.createSimpleGrid();

			// Create the grid
			this.createGrid();

			// Recenter the view
			this.resetView((KnowledgeGraph.environment == 'browser') ? 0.5 : 0);
		}

		// Update the elements
		this.updateStations();
		this.updateDistricts();
		this.updateConnections();

		// Call the base class method
		return super.update(forced);
	}


	// -------------------------------------------------------- PRIVATE METHODS

	/** Positions the stations using a simple grid.
	 * @param columns The number of columns of the grid.
	 * @param cellSize The size of the cells of the grid. */
	createSimpleGrid(columns = 5, separation = 200) {
		let rows = Math.round(this._stationsList.length / columns), halfWidth = (columns - 1) / 2, halfHeight = (rows - 1) / 2, x = -halfWidth, y = -halfHeight;
		for (let stationName in this._stations) {
			let station = this._stations[stationName];
			station.x = x * separation;
			station.y = y * separation;
			x++;
			if (x > halfWidth) {
				x = -halfWidth;
				y++;
			}
		}
	}


	/** Positions the stations using a regular grid.
	 * @param rows The number of rows of the grid.
	 * @param columns The number of columns of the grid.
	 * @param cellSize The size of the cells of the grid. */
	createGrid(rows = 5, columns = 10, cellSize = 100) {

		// Create the grid to position the stations more easily
		let grid = [], cx = Math.floor(columns / 2), cy = Math.floor(rows / 2);
		for (let x = 0; x < columns; x++) {
			grid[x] = [];
			for (let y = 0; y < rows; y++)
				grid[x][y] = undefined;
		}

		// Position the stations and create the connections
		let remainingStations = [...this._stationsList], stations = [];
		this._connections = {};
		this._connectionsList = [];
		while (remainingStations.length > 0) {
			let station = remainingStations.shift(), options = [];
			for (let x = 0; x < columns; x++) {
				for (let y = 0; y < rows; y++) {
					if (grid[x][y])
						continue;

					// Manhattan distance to the center of the grid
					let dx = cx - x, dy = cy - y, connectionDistance = Math.abs(dx) + Math.abs(dy), value = connectionDistance;

					let links = [];
					for (let line of station.lines) {
						let bestStation, bestValue = 100000;
						for (let previousStation of stations) {
							if (previousStation.lines.includes(line)) {
								let cdx = previousStation.x - x, cdy = previousStation.y - y, connectionDistance = Math.abs(cdx) + Math.abs(cdy);
								if (bestValue > connectionDistance) {
									bestValue = connectionDistance;
									bestStation = previousStation;
								}
							}
						}
						if (!bestStation)
							continue;
						links.push({ station: bestStation.name, line: line });
						value -= bestValue / 10;
						if (station.districts[0] == bestStation.districts[0])
							value -= 0.01;
					}
					options.push({ x: x, y: y, v: value, links: links });
				}
			}
			options.sort((a, b) => a.v - b.v);
			let bestGridPosition = options[0];
			grid[bestGridPosition.x][bestGridPosition.y] = station;
			station.gridX = bestGridPosition.x;
			station.gridY = bestGridPosition.y;

			for (let link of bestGridPosition.links) {

				// Check if a connection with the linked station exists
				let connectionName = station.name + '-' + link.station, connection = this._connections[connectionName];

				// If not, create it
				if (!connection) {
					connection = { a: station.name, b: link.station,
						lines: [], width: 0, component: new Component('g', this._connectionsElement, { id: connectionName }) };
					this._connections[connectionName] = connection;
					this._connectionsList.push(connection);
				}

				// Add the line to the connection
				let line = this._lines[link.line];
				new Component('polyline', connection.component, {
					id: connectionName + '-' + link.line,
					stroke: line.color, stroke_width: line.width
				});
				connection.width += line.width;
			}
			stations.push(station);
		}

		// Position the stations
		let stationIndex = 0, maxStation = typeof this.debug == 'number' ? this.debug : 0;
		for (let station of stations) {
			station.x = 1000;
			station.y = 1000;
			station.visible = false;
			if (maxStation && ++stationIndex > maxStation) {
				station.gridX = station.gridY = undefined;
				continue;
			}
			station.x = (station.gridX - cx) * cellSize;
			station.y = (station.gridY - cy) * cellSize;
			station.visible = true;
		}
	}


	/** Updates the stations. */
	updateStations() {
		for (let station of this._stationsList) {
			let display = station.visible ? undefined : 'none';
			station.element.setAttribute('display', display);
			if (!station.visible)
				continue;
			let transform = 'translate(' + station.x + ', ' + station.y + ')';
			station.element.setAttribute('transform', transform);
			station.infoElement.setAttribute('transform', transform);
		}
	}


	/** Updates the connections. */
	updateConnections() {
		for (let connection of this._connectionsList) {
			let a = this._stations[connection.a], b = this._stations[connection.b], x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;

			if (x1 == x2 && y1 == y2)
				continue;
			if (!a.visible)
				continue;

			// Calculate the combined width of the lines
			let width = 0;
			for (let lineName of connection.lines)
				width += this._lines[lineName].width;

			let offset = -width / 2, ox = y2 - y1, oy = -(x2 - x1);
			let l = Math.sqrt(ox * ox + oy * oy);
			ox /= l;
			oy /= l;

			for (let component of connection.component.children) {
				offset += parseFloat(component.getAttribute('stroke-width'));
				component.setAttribute('points', (x1 + ox * offset) + ',' + (y1 + oy * offset) + ' ' +
					(x2 + ox * offset) + ',' + (y2 + oy * offset));
			}
		}
	}


	/** Updates the districts. */
	updateDistricts() {
		let districtRadius = 50;
		for (let district of this._districtsList) {

			// Create the list of points
			let points = [];
			for (let stationName of district.stations) {
				let station = this._stations[stationName];
				if (station.gridX == undefined)
					continue;
				points.push({ x: station.x, y: station.y });
			}

			// If there are no points, don't draw anything
			if (points.length == 0)
				continue;

			// If there are is one point, create another point next to it
			if (points.length == 1)
				points.push({ x: points[0].x + 0.0001, y: points[0].y });

			// Get the starting point (the one with the lowest X value)
			let pointIndex, pointCount = points.length;
			let startVertex = 0, startingX = points[0].x;
			for (pointIndex = 1; pointIndex < pointCount; pointIndex++) {
				let point = points[pointIndex];
				if (startingX <= point.x)
					continue;
				startVertex = pointIndex;
				startingX = point.x;
			}

			// Calculate the convex hull
			let vertex = startVertex, angle, newAngle = 1000, vertexIndex = 0, vertexCount = pointCount, vertices = [];
			for (vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {

				// Get the x and y values of the current vertex
				let ox = points[vertex].x, oy = points[vertex].y;

				// Check all other points to detect possible vertices
				for (pointIndex = 0; pointIndex < pointCount; pointIndex++) {
					if (pointIndex == vertex ||
						vertices.includes(pointIndex))
						continue;
					let dx = points[pointIndex].x - ox, dy = points[pointIndex].y - oy;
					if (dx == 0 && dy == 0)
						continue;
					let a = Math.atan2(dy, dx);
					if (angle != undefined && a < angle)
						a += Math.PI * 2;
					if (newAngle > a) {
						newAngle = a;
						vertex = pointIndex;
					}
				}

				// Add the obtained vertex and angle values to the list
				vertices.push(vertex);
				angle = newAngle;
				newAngle = 1000;

				// If the vertex is the starting vertex, stop the process
				if (vertex == startVertex)
					break;
			}
			vertices.push(startVertex);
			vertices.unshift(startVertex);
			vertexCount = vertices.length;

			// Create the segments
			let lines = [], lineIndex = 0, lineCount = vertexCount - 1;
			for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
				let v1 = points[vertices[lineIndex]], v2 = points[vertices[lineIndex + 1]];
				lines.push({ p1: v1, p2: v2, angle: Math.atan2(v2.y - v1.y, v2.x - v1.x) });
			}

			// Create the path to draw, with an offset
			let offset = 50, path = '';
			for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
				let l = lines[lineIndex], l2 = lines[(lineIndex + 1) % lineCount], dx1 = Math.sin(l.angle) * districtRadius, dy1 = -Math.cos(l.angle) * districtRadius, dx2 = Math.sin(l2.angle) * districtRadius, dy2 = -Math.cos(l2.angle) * districtRadius, x1 = l.p1.x + dx1, y1 = l.p1.y + dy1, x2 = l.p2.x + dx1, y2 = l.p2.y + dy1, x3 = l.p2.x + dx2, y3 = l.p2.y + dy2;
				if (lineIndex == 0)
					path += 'M ' + x1 + ' ' + y1 + ' ';
				path += 'L ' + x2 + ' ' + y2 + ' '; // Line between points
				path += 'A ' + districtRadius + ' ' + districtRadius +
					' 0 0 1 ' + x3 + ' ' + y3 + ' '; // Arc to next line
			}
			district.element.setAttribute('d', path + 'Z');
		}
	}

	/** Updates the legends. */
	updateLegends() {
		let fontFamily = 'arial';
		this._linesLegendItems.clear();
		let lineIndex = 0;
		this._linesLegend.width.value = 200;
		this._linesLegend.height.value = 30 + 20 * (this._linesList.length);
		for (let line of this._linesList) {
			new Component('rect', this._linesLegend.component, {
				fill: line.color,
				x: 10, y: 30 + 20 * lineIndex, width: 20, height: 10
			});
			new Component('text', this._linesLegend.component, {
				id: line.name + 'legend', fill: 'url(#foreground_color)',
				x: 40, y: 40 + 20 * lineIndex, font_family: fontFamily,
				font_size: 14
			}, line.title);
			lineIndex++;
		}

		this._districtsLegendItems.clear();
		let districtIndex = 0;
		this._districtsLegend.width.value = 200;
		this._districtsLegend.height.value = 30 + 20 * (this._districtsList.length);
		for (let district of this._districtsList) {
			new Component('rect', this._districtsLegendItems, {
				fill: district.color,
				x: 10, y: 30 + 20 * districtIndex, width: 20, height: 10
			});
			new Component('text', this._districtsLegendItems, {
				id: district.name + 'legend', fill: 'url(#foreground_color)',
				x: 40, y: 40 + 20 * districtIndex, font_family: fontFamily,
				font_size: 14
			}, district.title);
			districtIndex++;
		}
	}



	/** Reset the view.
	 * @param duration The duration of the animation. */
	resetView(duration = 0.5) {

		// Get the bounding box with a
		let v = 10000, minX = v, maxX = -v, minY = v, maxY = -v, border = 100;
		for (let station of this._stationsList) {
			if (!station.visible)
				continue;
			if (minX > station.x)
				minX = station.x;
			if (maxX < station.x)
				maxX = station.x;
			if (minY > station.y)
				minY = station.y;
			if (maxY < station.y)
				maxY = station.y;
		}
		minX -= border;
		minY -= border;
		maxX += border;
		maxY += border;

		// Find the center and the right scale
		let scaleX = this._width.value / (maxX - minX), scaleY = this._height.value / (maxY - minY), scale = (scaleX < scaleY) ? scaleX : scaleY, cX = (minX + (maxX - minX) / 2) * scale, cY = (minY + (maxY - minY) / 2) * scale;

		// Find the vcenter and the right scale
		let map = this._map, p = map.position.getValues(), s = map.scale.value;
		if (duration > 0) {
			new Animation((t) => {
				this._map.scale.value = (1 - t) * s + t * scale;
				this._map.position.setValues((1 - t) * p.x + t * -cX, (1 - t) * p.y + t * -cY);
				// console.log(this._map.position.toString())
			}, undefined, 0, 1, 0, duration, true);
		}
		else {
			this._map.scale.value = scale;
			this._map.position.setValues(-cX, -cY);
		}
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the TransitMap class. */
TransitMap.type = new NodeType('TransitMap', 'transit_map', Widget.type, TransitMap);


// ********************************************** view\widgets\StyleSwitcher.js










/** Defines a StyleSwitcher Widget */
	   class StyleSwitcher extends Widget {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Switch instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, data, StyleSwitcher.type);

		// Initialize the child nodes
		this._value = new Boolean('value', this, false);

		// Disable when not in browser environment
		if (KnowledgeGraph.environment !== 'browser')
			return;

		// Set the properties of the widget
		this.width.value = 80;
		this.height.value = 100;
		this._backgroundColor.hex = '#00000000'; // Required for interaction

		// Create the components
		let cx = 40, cy = 40, ir = 20, or = 30, stroke = 5;
		for (let angle = 0; angle < 360; angle += 45) {
			let a = angle * Math.PI / 180, s = Math.sin(a), c = Math.cos(a);
			new Component('line', this.component, {
				x1: cx, x2: cy + c * or, y1: cx, y2: cy + s * or,
				stroke: 'url(#foreground_color)', stroke_width: stroke,
				stroke_linecap: 'round'
			});
		}
		let circle = new Component('circle', this.component, {
			cx: cx, cy: cy, r: 20, fill: 'url(#background_color)',
			stroke: 'url(#foreground_color)', stroke_width: stroke
		});
		let circle2 = new Component('circle', this.component, {
			cx: cx * 5 / 4, cy: cy, r: 0, fill: 'url(#background_color)',
			stroke: 'url(#foreground_color)', stroke_width: stroke
		});

		new Component('text', this.component, { x: 40, y: 100,
			stroke_linecap: 'round', text_anchor: 'middle', font_family: 'Arial',
			font_size: 14, fill: 'url(#foreground_color)' }, 'Switch Style');

		// Create the animation of the switch
		circle.animations['switch'] = new Animation(circle, 'r', ir, or, 0, 0.25, false);
		circle2.animations['switch'] = new Animation(circle2, 'r', 0, 20, 0, 0.25, false);

		// Create an event for the change
		function changed() {
			circle.animations['switch'].play(1, this._value.value);
			circle2.animations['switch'].play(1, this._value.value);
			this._value.value = !this._value.value;
			if (this._onChange)
				this._onChange(this);
			this.ancestor(UserInterface).style.value =
				this._value.value ? 'light' : 'dark';
		}
		this._component.onclick = changed.bind(this);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the StyleSwitcher class. */
StyleSwitcher.type = new NodeType('StyleSwitcher', 'style-switcher', Widget.type, StyleSwitcher);


// *********************************************** view\widgets\ViewResetter.js









/** Defines a ViewResetter Widget */
	   class ViewResetter extends Widget {


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new ViewResetter instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name, parent, data) {

		// Call the parent constructor
		super(name, parent, data, ViewResetter.type);

		// Disable when not in browser environment
		if (KnowledgeGraph.environment !== 'browser')
			return;

		// Set the properties of the widget
		this.width.value = 80;
		this.height.value = 100;
		this._backgroundColor.hex = '#00000000'; // Required for interaction

		// Create the components
		new Component('rect', this.component, {
			x: 10, y: 10, width: 60, height: 60, fill: 'url(#background_color)',
			stroke: 'url(#background_color)', stroke_width: 5
		});
		new Component('polyline', this.component, { fill: 'none',
			stroke_linecap: 'round', stroke: 'url(#foreground_color)',
			stroke_width: 5, points: [10, 30, 10, 10, 30, 10] });
		new Component('polyline', this.component, { fill: 'none',
			stroke_linecap: 'round', stroke: 'url(#foreground_color)',
			stroke_width: 5, points: [70, 30, 70, 10, 50, 10] });
		new Component('polyline', this.component, { fill: 'none',
			stroke_linecap: 'round', stroke: 'url(#foreground_color)',
			stroke_width: 5, points: [10, 50, 10, 70, 30, 70] });
		new Component('polyline', this.component, { fill: 'none',
			stroke_linecap: 'round', stroke: 'url(#foreground_color)',
			stroke_width: 5, points: [50, 70, 70, 70, 70, 50] });
		let circle = new Component('circle', this.component, {
			cx: 40, cy: 40, r: 20, stroke: 'url(#foreground_color)',
			stroke_width: 5, fill: 'none'
		});
		new Component('text', this.component, { x: 40, y: 100, text_anchor: 'middle', font_family: 'Arial',
			font_size: 14, fill: 'url(#foreground_color)' }, 'Reset View');

		// Create the animation of the switch
		circle.animations['switch'] = new Animation(circle, 'r', 0, 20, 0, 0.25, false);

		// Create an event for the change
		function changed() {
			circle.animations['switch'].play(1);
			if (this._onChange)
				this._onChange(this);
			let ui = this.ancestor(UserInterface);
			for (let callback of ui.onViewReset)
				callback();
		}
		this._component.onclick = changed.bind(this);
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the ViewResetter class. */
ViewResetter.type = new NodeType('ViewResetter', 'view-resetter', Widget.type, ViewResetter);


// ********************************************************** KnowledgeGraph.js

// --------------------------------------------------------------- EXPORTS LIST

// To avoid cyclical import errors, the following list provides access to the 
// different classes of the project in the right order.
// Note: While Typescript does not require adding the extension at the end, 
// after the transpilation, it is necessary for the file URL to end in ".js".































// --------------------------------------------------------------- IMPORTS LIST







// --------------------------------------------------------------- MAIN CLASS

/** Defines the main class that manages the KnowledgeGraph framework. */
	   class KnowledgeGraph extends Node {


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the InteroperabilityMap. */
	get title() { return this._title; }

	/** The data model of the InteroperabilityMap. */
	get model() { return this._model; }

	/** The user interface of the InteroperabilityMap. */
	get ui() { return this._ui; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the InteroperabilityMap instance.
	 * @param data The initialization data. */
	constructor(data = {}) {

		// Call the base class constructor
		const instanceCount = KnowledgeGraph.instances.length;
		super('KnowledgeGraph' + (instanceCount > 0 ? instanceCount : ''));
		if (instanceCount == 0)
			console.log('Initializing ' + KnowledgeGraph.name +
				' Version: ' + KnowledgeGraph.version +
				' (Environment: ' + KnowledgeGraph.environment + ')');
		KnowledgeGraph.instances.push(this);

		// Create the child nodes
		this._title = new String('title', this, data.title || this.name);
		this._model = new Model('model', this);
		this._ui = new UserInterface('ui', this);

		// Deserialize the initialization data
		if (data != undefined) {
			if (typeof data != 'object')
				throw Error('Invalid data for ' + this.id);
			this.deserialize(data);
		}

		// Start updating everything
		this.update();
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Facilitates the creation of a new InteroperabilityMap instance.
	 * @param data The initialization data. */
	static init(data = {}) {
		if (typeof data == 'object')
			return new KnowledgeGraph(data);
		else if (typeof data == 'string') {
			fetch(data).then((response) => response.text())
				.then((data) => {
				// Remove the comments and trailing commas from the JSONC files
				data = data.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
				data = data.replace(/\,\s*\n(\s*[}|\]])/gm, '\n$1');
				let jsonData = JSON.parse(data);
				new KnowledgeGraph(jsonData);
			});
		}
		else
			throw Error('Invalid data for InteroperabilityMap initialization');
	}
}

// --------------------------------------------------------------- METADATA

/** The type metadata of the Class class. */
KnowledgeGraph.type = new NodeType('KnowledgeGraph', 'root', Node.type, KnowledgeGraph);


// --------------------------------------------------------------- METADATA

/** The version of the Knowledge Graph framework. */
KnowledgeGraph.version = '0.7.0';

/** The global list of instances of the Knowledge Graph framework. */
KnowledgeGraph.instances = [];


// Check the type of environment the InteroperabilityMap is running on
KnowledgeGraph.environment =
	([typeof window, typeof document].includes('undefined')) ? 'node' : 'browser';




