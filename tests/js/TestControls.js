
/** Creates the test controls at the top of the screen. */
export class TestControls {

	/** Initializes a new instance of the TestControls class. 
	 * @param params The initialization parameters.
	 * @param params.name The name of the TestControls.
	 * @param params.title The title text of the TestControls.
	 * @param params.description The description text of the TestControls. */
	constructor(params = {}) {

		// Make this a singleton instance
		if (TestControls.instance) throw Error('Repeated TestControls');
		TestControls.instance = this;
		
		// The name of the environment
		this.name = params.name ||'TestControls';
		
		// Create the elements
		this.element = TestControls.createElement('div', this.name, 
			document.body, null, 'position: fixed; top: 0; left: 0; ' +
			'width:100%; z-index: 10000; display: flex; background: #0008;' +
			'color: white; overflow: hidden; font-family: sans-serif');

		// Create a button to go back to the index on the top right
		if (window.self == window.top) {
			this.backButton = TestControls.createElement('button', 'BackButton',
				this.element, null, 'margin: auto; border: none;' +
				'background: none; color: white; font-size: 5vh;', null, '↩',
				() => { location.href = '../index.html'; });
		}

		// Create the info panel on the top right
		this.infoPanel = TestControls.createElement('div', 'InfoPanel',
			this.element, null, 'margin:1vmin; user-select: none;');
		this.title = TestControls.createElement('h1', 'Title', this.infoPanel,
			null, 'margin: 0;', null, params.title || document.title);
		if (params.description) 
			this.description = TestControls.createElement('h2', 'Subtitle',
				this.infoPanel, null, 'margin: 0;', null, params.description);
		
		// Introduce a separator
		this.separator = TestControls.createElement('div', 'Separator', 
			this.element, null, 'flex: 1;');

		// Create the control panel on the top right
		this.controlPanel = TestControls.createElement('div', 'ControlPanel',
			this.element, undefined, 'color:white; font-size: 3vh;');
		
		// Create additional CSS rules
		if (document.styleSheets.length == 0)
			document.head.append(document.createElement('style'));
		let stylesheet = document.styleSheets[0];
		stylesheet.insertRule('#ControlPanel button { border: 1px solid white; ' +
			'background: none; color: white; font-size: 3vh; margin: 1vmin; } ');
	}

	/** Creates a DOM element
	 * @param type The type of the element (its tag name)
	 * @param id The id of the element.
	 * @param parent The parent of the element.
	 * @param classes The classes of the element.
	 * @param style The style of the element.
	 * @param content The HTML content of the element.
	 * @param onclick The callback function to launch on click.
	 * @returns The generated element. */
	static createElement(type, id, parent, classes, style, 
			attribs, content, onClick) {

		// Create the element
		let element = document.createElement(type);

		// Set the properties of the element
		if (id) element.id = id;
		if (classes) element.className = classes;
		if (style) element.style.cssText = style;
		if (attribs) for(let k in attribs) element.setAttribute(k, attribs[k]);
		if (content) element.innerHTML = content;
		if (onClick) element.addEventListener('click', onClick);
			
		// Set the parent of element
		((parent) ? parent : document.body).appendChild(element);

		// Return the generated element
		return element;
	}
}

