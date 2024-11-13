import { KnowledgeGraph } from "../KnowledgeGraph.js";
import { Node } from "../data/Node.js"
import { NodeSet } from "../data/NodeSet.js"
import { NodeType } from "../data/NodeType.js"
import { Number } from "../data/types/simple/Number.js"
import { String } from "../data/types/simple/String.js"
import { Color } from "../data/types/complex/Color.js"
import { Component } from "./Component.js";
import { Animation } from "./Animation.js";
import { Widget } from "./Widget.js";


/** Defines a User Interface to handle the interaction with the users. */
export class UserInterface extends Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the UserInterface class. */
	static type = new NodeType('UserInterface', 'ui', Node.type, UserInterface);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The main component of the UserInterface. */
	protected _component: Component;

	/** The definitions component of the UserInterface. */
	protected _definitions: Component;

	/** The background of the UserInterface. */
	protected _background: Component;

	/** The background color of the UserInterface. */
	protected _color: Color;

	/** The style the UserInterface. */
	protected _style: String;

	/** The resources of the UserInterface. */
	protected _resources: NodeSet<String>;

	/** The layers of the UserInterface. */
	protected _layers: NodeSet<Widget>;

	/** The name of the current view */
	protected _currentView : string;
	
	/** The width of the UserInterface. */
	protected _width: Number;

	/** The height of the UserInterface. */
	protected _height: Number;

	/** The ViewReset event handler. */
	protected _onViewReset: any[];


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The main component of the UserInterface. */
	get component(): Component { return this._component; }

	/** The background of the UserInterface. */
	get background(): Component { return this._background; }
	
	/** The background color of the UserInterface. */
	get color(): Color { return this._color; }

	/** The resources of the UserInterface. */
	get resources(): NodeSet<String> { return this._resources; }

	/** The layers of the UserInterface. */
	get layers(): NodeSet<Widget> { return this._layers; }

	/** The width of the UserInterface. */
	get width(): Number { return this._width; }

	/** The height of the UserInterface. */
	get height(): Number { return this._height; }

	/** The ViewReset event handler. */
	get onViewReset(): any[] { return this._onViewReset; }

	/** The style the UserInterface. */
	get style(): String { return this._style; }

	
	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Interface instance.
	 * @param parent The app reference.
	 * @param data The data of the app. */
	constructor(name: string, parent: KnowledgeGraph, data: any = {}) {
		
		// Call the parent class constructor
		super(name, parent, data);

		// Initialize the child nodes
		this._width = new Number('width', this, 2970);
		this._height = new Number('height', this, 2100);
		this._color = new Color('color', this, 'url(#background_color)');
		this._style = new String('style', this, 'dark');
		this._resources = new NodeSet<String>('resources', this, String.type);
		this._layers = new NodeSet<Widget>('layers', this, Widget.type);

		let width = this._width.value, height = this._height.value,
			color = this.color.toString(), unitType = 'mm';

		// If no SVG element was specified, create one
		if (!this._component) {
			let name = parent.title.value;
			this._component = new Component('svg', undefined, { id: name,
				xmlns: 'http://www.w3.org/2000/svg', version: "1.1",
				"xmlns:xlink":  "http://www.w3.org/1999/xlink",
				width: (width/10) + unitType, height: (height/10) + unitType,
				viewBox: '0 0 ' + width + ' ' + height
			});
		}

		// Create a system to handle the resizing
		if (KnowledgeGraph.environment == 'browser') {
			// Remove any existing elements except scripts
			let element = this._component.element, children = element.childNodes, 
				childIndex = 0, childCount = children.length;
			for (childIndex = 0; childIndex < childCount; childIndex++) {
				let child = children.item(childIndex);
				if (child.nodeType != child.ELEMENT_NODE ||
					!((child as Element).tagName == 'defs' ||
						(child as Element).tagName == 'script')) {
						this._component.element.removeChild(child); 
						childIndex--; childCount--;
				}
			}
			

			// Add the element to the browser
			let parentElement = data.element || document.body ;
			if (KnowledgeGraph.environment == 'browser' && ! parentElement) {
				// Set the style of the element
				this._width.value = window.innerWidth;
				this._height.value = window.innerHeight;
				console.log(this._width.value, this._height.value);
			} else {
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
		if (data != undefined) this.deserialize(data);

		// Create the definitions
		this._definitions = new Component('defs', this._component);

		// Create the colors
		let style = this._style.value = 
			(KnowledgeGraph.environment == 'browser')? 'dark': 'light',
			black = '#111111', white = '#FFFFFF',
			color1 = style == 'light'? white : black,
			color2 = style == 'light'? black : white;
		let background_color = new Component('linearGradient', 
			this._definitions, { id: 'background_color' });
		new Component('stop', background_color, {'stop-color': 
			color1, 'stop-opacity': 1});
		let foreground_color = new Component('linearGradient', 
				this._definitions, { id: 'foreground_color' });
		new Component('stop', foreground_color, { 
				'stop-color': color2, 'stop-opacity': 1});
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
			this._component.element.addEventListener('resize', 
				this.resize.bind(this));

			// Disable the right click menu
			window.oncontextmenu = (e) => { e.preventDefault(); };
		}
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Node instance.
	 * @param forced Whether to force the update or not. 
	 * @return Whether the node has been updated or not*/
	update(forced: boolean = false) : boolean {

		// Update the color of the background
		if (!this._color.updated)
			this._background.setAttribute('fill', this._color.toString());

		// Update the style
		if (!this._style.updated) {
			// Create the colors to switch to
			let black = new Color('black', undefined, [0.0, 0.0, 0.0]),
				white = new Color('white', undefined, [1.0, 1.0, 1.0]),
				foregroundNode = this._definitions.children[0].children[0],
				backgroundNode = this._definitions.children[1].children[0];
			let color1: Color, color2: Color;
			switch (this._style.value) {
				case "light": color1 = white; color2 = black; break;
				case "dark": color1 = black; color2 = white; break;
			}
			// Animate the transition between colors
			// if (KnowledgeGraph.environment == 'browser') {
				new Animation((t:number) => { 

					let c1 = Color.interpolate(color2, color1, t).hex,
						c2 = Color.interpolate(color1, color2, t).hex;
					foregroundNode.setAttribute('stop-color', c1);
					backgroundNode.setAttribute('stop-color', c2);
					console.log(c1);
				}, undefined,0,1,0,0.2, true);

			if (this.debug) console.log('Switched style to: ' + this._style.value);
		}

		if (!this._resources.updated)
			for (let resource of this._resources) new Component('g', 
				this._definitions,{ id: resource.name }, resource.value);
				
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
				if (layer.enabled) layer.resize(2970, 2100);
			return;
		}

		// Take advantage of the CSS styling to update the size of the SVG
		let element = this._component.element , 
			width = element.clientWidth, height = element.clientHeight;
		this.width.value = width; this.height.value = height;
		this._component.width = width; this._component.height = height;
		this._component.setAttribute('width', width);
		this._component.setAttribute('height', height);
		this._component.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
		this._background.setAttribute('width', width);
		this._background.setAttribute('height', height);

		// Show a message on console
		if (this.debug) console.log("Resized: " + width + ' x ' + height);

		// Resize the layers
		for (let layer of this._layers) 
			if (layer.enabled) layer.resize(width, height);

		// Update the user interface
		this.update()
	}
}
