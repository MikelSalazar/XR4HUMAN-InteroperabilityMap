// --------------------------------------------------------------- EXPORTS LIST

// To avoid cyclical import errors, the following list provides access to the 
// different classes of the project in the right order.
// Note: While Typescript does not require adding the extension at the end, 
// after the transpilation, it is necessary for the file URL to end in ".js".
export { NodeType } from "./data/NodeType.js"
export { Node } from "./data/Node.js"
export { NodeSet } from "./data/NodeSet.js"
export { NodeLink } from "./data/NodeLink.js"
export { Simple } from "./data/types/Simple.js"
export { Boolean } from "./data/types/simple/Boolean.js"
export { Number } from "./data/types/simple/Number.js"
export { String } from "./data/types/simple/String.js"
export { Complex } from "./data/types/Complex.js"
export { Vector } from "./data/types/complex/Vector.js"
export { Color } from "./data/types/complex/Color.js"
export { Item } from "./data/model/Item.js"
export { Domain } from "./data/model/items/Domain.js"
export { Class } from "./data/model/items/Class.js"
export { Property } from "./data/model/items/Property.js"
export { ClassInstance } from "./data/model/items/ClassInstance.js"
export { Relation } from "./data/model/items/Relation.js"
export { RelationInstance } from "./data/model/items/RelationInstance.js"
export { Model } from "./data/model/Model.js"

export { Animation, Easing } from "./view/Animation.js"
export { Component } from "./view/Component.js"
export { Widget } from "./view/Widget.js"
export { UserInterface } from "./view/UserInterface.js"
export { Graphic } from "./view/widgets/Graphic.js"
export { Text } from "./view/widgets/Text.js"
export { TransitMap } from "./view/widgets/TransitMap.js"
export { StyleSwitcher } from "./view/widgets/StyleSwitcher.js"
export { ViewResetter } from "./view/widgets/ViewResetter.js"


// --------------------------------------------------------------- IMPORTS LIST

import { Node } from "./data/Node.js"
import { NodeType } from "./data/NodeType.js"
import { String } from "./data/types/simple/String.js"
import { UserInterface } from "./view/UserInterface.js"
import { Model } from "./data/model/Model.js";

// --------------------------------------------------------------- MAIN CLASS

/** Defines the main class that manages the KnowledgeGraph framework. */
export class KnowledgeGraph extends Node {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the Class class. */
	static type = new NodeType('KnowledgeGraph', 'root', Node.type, 
		KnowledgeGraph);
	

	// --------------------------------------------------------------- METADATA

	/** The version of the Knowledge Graph framework. */
	static version: string = '0.7.0';

	/** The global list of instances of the Knowledge Graph framework. */
	static instances: KnowledgeGraph[] = [];

	/** The execution environment ("node" or "browser"). */
	static environment: string;


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The title of the of the InteroperabilityMap. */
	protected _title: String;

	/** The data model of the InteroperabilityMap. */
	protected _model: Model;

	/** The user interface of the InteroperabilityMap. */
	protected _ui: UserInterface;


	// ------------------------------------------------------ PUBLIC PROPERTIES

	/** The title of the InteroperabilityMap. */
	get title(): String { return this._title; }
	
	/** The data model of the InteroperabilityMap. */
	get model(): Model { return this._model; }
	
	/** The user interface of the InteroperabilityMap. */
	get ui(): UserInterface { return this._ui; }

	
	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes the InteroperabilityMap instance.
	 * @param data The initialization data. */
	constructor(data: any = {}) {

		// Call the base class constructor
		const instanceCount = KnowledgeGraph.instances.length;
		super('KnowledgeGraph' + (instanceCount > 0? instanceCount: ''));
		if (instanceCount == 0) console.log(
			'Initializing '+ KnowledgeGraph.name + 
			' Version: '+ KnowledgeGraph.version + 
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
	static init(data: any = {}): KnowledgeGraph { 
		if (typeof data == 'object') return new KnowledgeGraph(data); 
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
		else throw Error('Invalid data for InteroperabilityMap initialization');
	}


	// /** Creates a printable version of the InteroperabilityMap.
	//  * @param pageWidth The width of the page in millimeters.
	//  * @param pageHeight The width of the page in millimeters.
	//  * @param marginX The horizontal margin of the page in millimeters.
	//  * @param marginY The vertical margin of the page in millimeters.
	//  * @param width The width of the viewport in pixels.
	//  * @param height The height of the viewport in pixels.
	//  * @returns The printable SVG element in a string representation. */
	// print (pageWidth: number = 297, pageHeight: number = 210, 
	// 		marginX: number = 5, marginY: number = 5,
	// 		width: number = 2800, height: number = 2000): string {

	// 	// First, resize the viewport
	// 	this._viewport.resize(width, height);
		
	// 	// Adjust the attributes of the SVG element
	// 	let printedElement = this._viewport.component;
	// 	printedElement.set('width', pageWidth + 'mm');
	// 	printedElement.set('height', pageHeight + 'mm');
	// 	printedElement.set('viewBox', '' + (-marginX) + ' ' + (-marginY) + 
	// 		' ' + pageWidth + ' ' + pageHeight);

	// 	// Return the result
	// 	return printedElement.toString();
	// }
}


// Check the type of environment the InteroperabilityMap is running on
KnowledgeGraph.environment = 
	([typeof window, typeof document].includes('undefined'))? 'node':'browser';

