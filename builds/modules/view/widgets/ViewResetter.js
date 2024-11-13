import { NodeType } from "../../data/NodeType.js";
import { Component } from "../Component.js";
import { Widget } from "../Widget.js";
import { Animation } from "../Animation.js";
import { UserInterface } from "../UserInterface.js";
import { KnowledgeGraph } from "../../KnowledgeGraph.js";


/** Defines a ViewResetter Widget */
export class ViewResetter extends Widget {


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
//# sourceMappingURL=ViewResetter.js.map