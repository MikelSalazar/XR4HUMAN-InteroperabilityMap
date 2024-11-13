import { NodeType } from "../../data/NodeType.js";
import { Boolean } from "../../data/types/simple/Boolean.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
import { Animation } from "../Animation.js";
import { UserInterface } from "../UserInterface.js";
import { KnowledgeGraph } from "../../KnowledgeGraph.js";


/** Defines a StyleSwitcher Widget */
export class StyleSwitcher extends Widget {


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
//# sourceMappingURL=StyleSwitcher.js.map