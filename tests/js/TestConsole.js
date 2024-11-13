import { TestControls } from "./TestControls.js";

/** Creates the test console at the bottom of the screen. */
export class TestConsole {

	/** Initializes a new instance of the TestConsole class. 
	 * @param params the initialization parameters. */
	constructor(params = {}) {

		// Make this a singleton instance
		if (TestConsole.instance) 
			throw Error('TestConsole can only be instantiated once');
		TestConsole.instance = this;

		// The name of the environment
		this.name = params.name || 'TestConsole';

		// Create the elements
		this.element = document.createElement('div'); 
		this.element.id = this.name;
		this.element.style.cssText = 'position: fixed; bottom: 0; left: 0; ' +
			'z-index:1000; width: 100%; display: flex; flex-direction: column; ' +
			'font-family: Courier New; font-weight: bold; font-size: 2vh; '  +
			'background: #222A; color: white; font-family: Courier New;';
		document.body.appendChild(this.element)
		
		this.header = document.createElement('div');
		this.header.id = this.name + 'Header';
		this.header.style.cssText =	'display: flex; background: #0008; ' +
			' font-family: Arial; padding: 1vh; user-select: none;';
		this.element.appendChild(this.header)

		this.headerTitle = document.createElement('div');
		this.headerTitle.innerText = 'Console:';
		this.header.appendChild(this.headerTitle);

		this.headerSeparator = document.createElement('div');
		this.headerSeparator.style.cssText = 'flex: 1;';
		this.header.appendChild(this.headerSeparator);

		this.closeButton =  document.createElement('button'), 
		this.closeButton.style.cssText = 'border: none; background: none; ' +
			' color: white; ' +
			'font-family: Arial; font-weight: bold; font-size: 2vh; ',
		this.closeButton.innerHTML = '✖';
		this.closeButton.onclick = () => { this.display(!this.visible); };
		this.header.appendChild(this.closeButton)

		this.messages = document.createElement('div');
		this.messages.id = this.name + 'Messages';
		this.messages.style.cssText = 'overflow: hidden auto;' +
			'scrollbar-color: #FFF8 #0004; flex: 1; mix-blend-mode: exclusion;' +
			'font-family: Courier New; font-weight: bold; font-size: 2vh;';
		this.element.appendChild(this.messages)

	 	// Create an command input at the bottom
		this.commandInput = document.createElement('input'),
		this.commandInput.id = this.name + 'CommandInput';
		this.commandInput.style.cssText = 
			'background: #000A; color: white; padding: 1vh;' +
			'border: 1px solid white; outline: none; ' +
			'font-family: Courier New; font-weight: bold; font-size: 2vh;';
		this.element.appendChild(this.commandInput)
		this.commandInput.onchange = (event) => {
			event.preventDefault();
			let command = this.commandInput.value;
			try { eval(command); }
			catch (e) { this.log('ERROR: Unknown command: "' + command + '"', 2)}
			this.commandInput.value = '';
		}

		this.consolesLockScroll = true; this.userScrolling = true;
		this.infoColor = '#dddddd'; this.warnColor = '#ffff00'; 
		this.validColor = '#22dd22'; this.errorColor = '#dd2222';
		this.visible = params.visible != undefined? params.visible : true;
		this.size = params.size != undefined? params.size : 100;
		this.display(this.visible, this.size);

		// Disable automatic scroll if the user manually scrolls the console
		this.messages.onscroll = (e) => { 
			if (this.userScrolling) this.consolesLockScroll = false; 
			this.userScrolling = true;
		}
		
		window.addEventListener('resize', () => {
			if (this.visible) this.display(true);
		})

		// Handle the visibility of the panel
		this.toggleKey = params.toggleKey || 'º';
		document.addEventListener('keyup', (e) => {
			if (e.key == this.toggleKey) this.display(!this.visible);
		} );
	}

		
	/** Sets the state of the test environment. 
	* @param visible Whether to show the panel or not. 
	* @param size The size of the panel. */
	display(visible = false, size) {
		this.visible = visible; 
		if(size != undefined) {
			if (typeof size != 'number') size = 50;
			if (size < 0) size = 0; else if (size > 100) size = 100;
			this.size = size;
		}

		// Set the maximum height
		let height = window.innerHeight;
		if (TestControls.instance) 
			height -= TestControls.instance.element.clientHeight;
		height = this.size / 100 * height;
		
		// Adjust the size
		if (this.size == 100) {
			this.header.style.display = 'none';
			this.element.style.height = height + 'px';
			this.element.style.height = height + 'px';
		} else {
			this.header.style.display = 'flex';
			this.element.style.display = 'flex';
			this.element.style.height = height + 'px';
		}

		// Show or hide the main element
		this.element.style.display = this.visible? 'flex': 'none';
	}


	/** Shows a message on the console. 
	 * @param message The message to display.
	 * @param {*} tabs The tabulation level of the log message
	 * @param {*} color The color of the log message.
	 * @param {*} maxTabs The maximum tabulation level of the log message.
	 * @param {*} callback The callback of the log message.
	 * @param {*} stack The stack of the log message. */
	log(message = '', tabs = 0, color = null, maxTabs = 0, callback, stack) { 
	
		// If the message is undefined, show a special message
		if (message == undefined) message = '[undefined]';

		// If there is no message, create a blank line
		if (message == '') { 
			let element = document.createElement('pre');
			element.textContent = ' '
			this.messages.appendChild(element);
			oldLog(); return; 
		}

		// If the message is not a string, try to convert it to a string
		if (typeof message != 'string') message = '' + message;

		// Check the maximum number of tabs in each line of the message and 
		// hidden those with higher number than allowed
		if (maxTabs) {
			let lines = message.split('\n'),lineIndex, lineCount = lines.length,
				lineRemovalStart = -1, lineRemovalCount = 0;
			for (lineIndex = 0; lineIndex < lineCount; lineIndex++) 
				if (lines[lineIndex].startsWith('\t'.repeat(maxTabs))) {
					if (lineRemovalStart < 0) lineRemovalStart = lineIndex;
					lineRemovalCount++;
				} else  {
					if (lineRemovalStart >=  0) {
						lines.splice(lineRemovalStart--, lineRemovalCount,
							['\t'.repeat(maxTabs) + '(Hidden lines: ' 
							+ lineRemovalCount + ')']);
						lineIndex -= lineRemovalCount - 1;
						lineCount -= lineRemovalCount - 1;
						lineRemovalStart = -1; lineRemovalCount = 0;
					}
				}
			message = lines.join('\n')
		} ;

		// Create the html element for the panel console
		let element = document.createElement('pre')
		this.messages.appendChild(element);
		element.innerHTML = message || '&nbsp;';
		element.style.cssText = 'padding: 0.5vmin;'; 
		if (color) element.style.color = color;
		if (tabs) element.style.paddingLeft = (tabs * 10) + 'px' ;
				
		// Check if we have to lock the scroll at the bottom
		if (this.consolesLockScroll) {
			this.userScrolling = false; 
			this.messages.scrollTop = this.messages.scrollHeight;
		}

		// Use the messages to show the caller
		if (typeof message  == 'object') callback(message);
		else {
			if (!stack) {
				let params = undefined;
				if(tabs) message = ' '.repeat(tabs) + message;
				if (color) { 
					message = '%c' + message;
					params = 'color: ' + color; 
				}
				console.groupCollapsed(message, params);
				// stack = new Error().stack.split('\n')
				// // for (let lineIndex = 0; lineIndex < stack.length; lineIndex++) {
				// // 	let line = stack[lineIndex], l = line.trim();
				// // 	if (l == 'Error' || l.includes('TestConsole.js')) {
				// // 		stack.shift(); lineIndex--;
				// // 	}
				// // 	stack[lineIndex] = line.replace(/ *at /g, '');
				// // 	stack[lineIndex] = line.replace(/@/g, ' ');
				// // }
				// oldLog(stack.join('\n'));
				console.trace()
				console.groupEnd();
			} else oldError(stack);
		}

		// Return the element
		return element;
	}


	/** Adds an info message to the list.
	 * @param {*} message The message to log.
	 * @param {*} tabs The tabulation level. */
	logInfo(message, tabs = 0) { this.log(message, tabs, this.infoColor); }


	/** Adds an warning message to the list.
	 * @param {*} message The message to log.
	 * @param {*} tabs The tabulation level. */
	logWarn(message, tabs = 0) { this.log(message, tabs, this.warnColor); }


	/** Adds an error message to the list.
	 * @param {*} message The message to log.
	 * @param {*} tabs The tabulation level. */
	logError(message, tabs = 0) { this.log(message, tabs, this.errorColor); }	

	/** Adds an error message to the list.
	 * @param {*} message The message to log.
	 * @param {*} tabs The tabulation level. */
	logSuccess(message, tabs = 0) { this.log(message, tabs, this.validColor); }
}



// Capture the console commands
let oldLog = console.log, oldWarn = console.warn, oldError = console.error;
console.log = (message) => {
	if (TestConsole.instance) TestConsole.instance.logInfo(message);
	else oldLog(message);
}
console.warn = (message) => { 
	let test = TestConsole.instance; if (!test) { oldWarn(message); return; }
	test.logWarn(message); 
}
console.error = (message) => { 
	let test = TestConsole.instance; if (!test) { oldError(message); return; }
	test.logError(message); test.show(true); 
}
window.onerror = (message) => {
	// oldError(message);
	let testEnvironment = TestConsole.instance; 
	if (!testEnvironment) return;
	testEnvironment.runningTests = false;
	testEnvironment.logError(message); testEnvironment.display(true);
};
