import { Node } from "../data/Node.js";
import { NodeSet } from "../data/NodeSet.js";
import { NodeType } from "../data/NodeType.js";
import { Number } from "../data/types/simple/Number.js";
import { String } from "../data/types/simple/String.js";
import { Vector } from "../data/types/complex/Vector.js";
import { Color } from "../data/types/complex/Color.js";
import { Component } from "./Component.js";
import { UserInterface } from "./UserInterface.js";


/** Defines a basic interactive Widget */
export class Widget extends Node {


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
//# sourceMappingURL=Widget.js.map