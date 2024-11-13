import { Node } from "../../data/Node.js"
import { NodeType } from "../../data/NodeType.js"
import { Number } from "../../data/types/simple/Number.js"
import { String } from "../../data/types/simple/String.js"
import { Color } from "../../data/types/complex/Color.js"
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";


/** Defines a Text Widget */
export class Text extends Widget {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Text class. */
	static type = new NodeType('Text', 'text', Widget.type, Text);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The text string of the Text. */
	protected _text: String;

	/** The font name of the Text. */
	protected _font: String;

	/** The alignment of the Text. */
	protected _align: String;

	/** The font size of the Text. */
	protected _size: Number;

	/** The color of the Text. */
	protected _color: Color;

	/** The text component of the text. */
	protected _textComponent: Component;

	/** The callback function for the click Text. */
	protected _onClick: CallableFunction;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The text string of the Text. */
	get text(): String { return this._text; }

	/** The font name string of the Text. */
	get font(): String { return this._font; }

	/** The font name string of the Text. */
	get align(): String { return this._align; }

	/** The font size of the Text. */
	get size(): Number { return this._size; }

	/** The color of the Text. */
	get color(): Color { return this._color; }


	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new Text instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name: string, parent: Node, data?: any) {

		// Call the parent constructor
		super(name, parent, undefined, Text.type);

		// Initialize the child nodes
		this._text = new String('text', this, undefined, '<text>');
		this._font = new String('font', this, undefined, 'Arial');
		this._align = new String('align', this, { 
			validValues: ['right', 'center', 'left']}, 'right');
		this._size = new Number('size', this, undefined, 15);
		this._color = new Color('color', this, 'url(#foreground_color)');
		
		// Create the component of the text
		this._textComponent = new Component('text', this._component);

		// Deserialize the initialization data
		if (data != undefined) this.deserialize(data);
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the Text instance.
	 * @param forced Whether to force the update or not.
	 * @return Whether the node has been updated or not*/
	update(forced: boolean = false): boolean {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced) return;

		// Update the text component
		let c = this._textComponent;
		if (!this._text.updated) c.content = this._text.value;
		if (!this._font.updated) c.setAttribute('font_family',this._font.value);
		if (!this._size.updated) c.setAttribute('font_size', this._size.value);
		if (!this.color.updated) c.setAttribute('fill', this.color.toString());
	
		// Call the base class method
		return super.update();
	}
}