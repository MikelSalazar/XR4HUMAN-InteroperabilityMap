import { KnowledgeGraph } from "../KnowledgeGraph.js";
import { Animation } from "./Animation.js";


/** Creates a visual component (that can be directly be serialized to SVG). */
export class Component {

	// ------------------------------------------------------- PROTECTED FIELDS

	/** The tag of the Component. */
	protected _tag: string;

	/** The attributes of the Component. */
	protected _attributes: Record<string, string>;
	
	/** The animations of the Component. */
	protected _animations: Record<string, Animation>;

	/** The width of the Component. */
	protected _width: number;

	/** The height of the Component. */
	protected _height: number;

	/** The content of the Component. */
	protected _content: string;

	/** The enabled state of the Component. */
	protected _enabled: boolean;

	/** The encapsulated SVG element. */
	protected _element: SVGElement;

	/** The parent Component instance. */
	protected _parent: Component;

	/** The child Component instances. */
	protected _children: Component[];

	/** The handler for click events. */
	protected _onclick: any;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The tag of the Component. */
	get tag(): string { return this._tag; }
	
	/** The width of the Component. */
	get width(): number { return this._width; }
	set width(w: number){ this._width = w; }

	/** The height of the Component. */
	get height(): number { return this._height; }
	set height(h: number){ this._height = h; }

	/** The content of the Component. */
	get content() { return this._content; }
	set content(c: string) { 
		this._content = c; if (this._element) this._element.innerHTML = c;
	}
	
	get enabled(): boolean { return this._enabled; }
	set enabled(e: boolean) {
		this._element.setAttribute('visibility', e? 'visible': 'hidden');
		this._enabled = e;
	}

	/** The encapsulated SVG element. */
	get element(): SVGElement { return this._element; }

	/** The parent Component instance. */
	get parent(): Component { return this._parent; }

	/** The child Component instances. */
	get children(): Component[] { return this._children; }

	/** The animations of the Component. */
	get animations(): Record<string, Animation> { return this._animations; }


	
	/** The handler for click events. */
	get onclick(): any { return this._onclick; }
	set onclick(listener:any) { 
		if (KnowledgeGraph.environment != 'browser') return;
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
	constructor(tag: string, parent?: Component, attributes?: any, 
		content?: string, onclick?: any) {

		// Set the tag, attributes and content of the component
		if (tag) this._tag = tag; else throw Error('Invalid SVG tag');

		// If possible, create the SVG element with the "document" instance
		if (KnowledgeGraph.environment == 'browser') {
			if (attributes && attributes.id) this._element = 
				document.getElementById(attributes.id) as any as SVGElement;
			if (!this._element)	this._element = document.createElementNS(
				'http://www.w3.org/2000/svg', tag);
			if (parent) parent._element.appendChild(this._element);
		}

		// Set the attributes
		this._attributes = {}; let a = attributes;
		if (attributes != undefined && typeof attributes == 'object') {
			for(let key in attributes) this.setAttribute(key, attributes[key]);
		}

		// Create the list of animations
		this._animations = {};

		// Set the content
		if (content) this.content = content; else this._content = '';

		// Set the handler for click events
		if (onclick) this.onclick = onclick;

		// Set the parent-child relationship
		this._parent = parent; this._children = [];
		if (parent != undefined) parent._children.push(this);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Gets the value of an attribute.
	 * @param name The name of the attribute.
	 * @returns The value of the attribute. */
	getAttribute(name: string): string { return this._attributes[name]; }


	/** Sets the value of an attribute.
	 * @param name The name of the attribute.
	 * @param value The new value of the attribute. */
	setAttribute(name: string, value: any) {
		if (typeof value == 'number') value = Component.serializeNumber(value);
		if (name.indexOf('_') >= 0) name = name.replace(/_/g, '-');
		this._attributes[name] = value;
		if (this._element) {
			if (value != undefined) this._element.setAttribute(name, value);
			else this._element.removeAttribute(name);
		}
	}

	/** Brings the component to the front. */
	bringToFront() {
		if (this._element && this._element.parentNode){
			if (!this._element.nextElementSibling) return;
			let parentElement = this._element.parentNode;
			parentElement.removeChild(this._element);
			parentElement.appendChild(this._element);
		}
	}

	/** Clears the component. */
	clear() {
		for(let child of this._children) child._element.remove();
		this._children = [];
	}

	// --------------------------------------------------------- PUBLIC METHODS

	/** Serializes a number to a string representation.
	 * @param value The numeric value to serialize.
	 * @returns The string with the numeric value. */
	static serializeNumber(value: number) {
		let string = value.toFixed(5), point = string.indexOf('.'), 
			cursor = point + 1, l = string.length;
		while (cursor > 0 && cursor < l-1) {
			if (string[cursor] == '0' && string[cursor+1] == '0') {
				if (cursor == point + 1) cursor = point;
				string = string.slice(0, cursor); break;
			}
			cursor++;
		}
		return string;
	}


	/** Serializes the Component to its SVG representation.
	 * @param tabLevel The tabulation level.
	 * @returns The SVG representation of the Component (as lines). */
	toString(tabLevel: number = 0): string {

		// Create the start tag
		let result = '\t'.repeat(tabLevel) + '<' + this.tag;

		// Add the attributes to the start tag
		for (let key in this._attributes)
			result += ' ' + key + '="' + this._attributes[key] + '"';

		// If there is any content, add it and return the result
		if (this._content) return result+'>'+this._content+'</'+this.tag+'>';
			
		// If there are no children, close the start tag and return the result
		if (this._children.length == 0) return result + '/>';
	
		// Create the list of children and finish with an end tag
		result += '>';
		for (let child of this._children) 
			result += '\n' + child.toString(tabLevel+1);
		return result + '\n' + '\t'.repeat(tabLevel) + '</' + this.tag + '>';
	}
}