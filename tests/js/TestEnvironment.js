import { TestConsole } from './TestConsole.js'

// ----------------------------------------------------- TEST ENVIRONMENT CLASS

/** Creates a test environment. */
export class TestEnvironment {

	/** Initializes a new instance of the TestEnvironment class. 
	 * @param params the initialization parameters.
	 * @param params.title The title of the test.
	 * @param params.visible The visibility of the panel.
	 * @param params.size The size of the panel.
	 * @param params.toggleKey The key to toggle the visibility of the panel. */
	constructor(params = {}) {
		// Make this a singleton instance
		if (TestEnvironment.instance) throw Error('Repeated TestEnvironment');
		TestEnvironment.instance = this;

		// Create a list of test groups
		this.tests = []; this.testGroups = []; 
	
		// Initialize the variables
		this.stopOnInvalidTest = false; 
		this.runningTests = false;
		this.validTests = 0; this.invalidTests = 0;
		this.delay = params.delay || 10;
		this.createParagraph = params.createParagraph;
	}


	/** Shows a message on the console. 
	 * @param message The message to display.
	 * @param {*} tabs The tabulation level of the log message
	 * @param {*} color The color of the log message.
	 * @param {*} maxTabs The maximum tabulation level of the log message.
	 * @param {*} callback The callback of the log message.
	 * @param {*} stack The stack of the log message. */
	log(message = '', tabs = 0, color = null, maxTabs = 0, callback, stack) { 
		if (message == undefined) message = 'undefined';
		if (typeof message != 'string') message = message.toString();
		if (!TestConsole) { console.log(message); }
		else TestConsole.instance.log(message, tabs, color, maxTabs, 
				callback, stack)

		if (this.createParagraph) {
			let paragraph = document.createElement('p');
			paragraph.innerText = message; paragraph.style.color = color;
			document.body.append(paragraph);
		}
	}


	/** Runs the tests. */
	start() {
		// Reinitialize the variables
		this.runningTests = true;
		this.currentTest = 0; this.currentGroup = null;
		this.validTests = 0; this.invalidTests = 0;

		// Show a text on console
		console.log('TESTS STARTED');
		
		// Create the test runner
		this.testRunner = setInterval(() => {
			if (!this.runningTests) {
				this.log();  this.log('TESTS MANUALLY STOPPED' + ' (OKs: ' + 
					this.validTests + ', Errors: ' + this.invalidTests + ')'); 
				clearInterval(this.testRunner);
				return;
			}
			if (this.currentTest >= this.tests.length) {
				this.log(); this.log('TESTS COMPLETED ' + ' (OKs: ' + this.validTests + 
					', Errors: ' + this.invalidTests + ')'); 
				clearInterval(this.testRunner); this.runningTests = false;
				return;
			}		

			// Get the test
			let test = this.tests[this.currentTest], valid; 

			// Check the current test group
			if (this.currentGroup != test.group) {
				this.currentGroup = test.group;
				this.log(); this.log(test.group.name.toUpperCase() + 
					(!test.group.enabled? ' (DISABLED)' : ''));
			}

			// Check if the current test group is enabled
			if (test.group.enabled) {;
				try { valid = test.run(); }
				catch (e) {
					clearInterval(this.testRunner); this.runningTests = false;
					console.error('Error in test "' + test.name + '":' + e.message);
					throw e;
					return;
				}

				if (valid) this.validTests++; else this.invalidTests++;
				if (!valid && this.stopOnInvalidTest) {
					this.log(); // Blank line
					this.log('TESTS STOPPED ON INVALID TEST' + ' (OKs: ' + 
					this.validTests + ', Errors: ' + this.invalidTests + ')'); 
					clearInterval(this.testRunner); this.runningTests = false;
					return;
				}
			}

			// Check the current test
			this.currentTest++;
			if (this.currentTest >= this.tests.length) {
				this.log(); // Blank line
				this.log('TESTS COMPLETED ' + ' (OKs: ' + this.validTests + 
					', Errors: ' + this.invalidTests + ')'); 
				clearInterval(this.testRunner); this.runningTests = false;
				return;
			}
		}, this.delay)
	}
}

// ----------------------------------------------------------- TEST GROUP CLASS

/** Defines a group of unit tests. */
export class TestGroup {

	/** Initializes a new TestGroup instance.
	 * @param {string} name The name of the test group.
	 * @param {TestEnvironment} environment The test environment. 
	 * @param {boolean} enabled Whether the test group is enabled or not. */
	constructor(name, environment, enabled = true) {
		if (!name) throw Error('Invalid name for test "' + name + '"');
		this.name = name; 
		if (!environment)throw Error('No test environment provided for' + name);
		this.environment = environment; this.environment.testGroups.push(this); 
		this.enabled = enabled; this.tests = [];
	}

	/** Runs the test group. */
	add(test) { this.tests.push(test); this.environment.tests.push(test); }
}


// ----------------------------------------------------------------- TEST CLASS

/** Defines a unit test. */
export class Test {

	/** Initializes a new Test instance.
	 * @param {string} name The name of the test.
	 * @param {TestGroup} group The test group.
	 * @param {*} code The code (function callback) to validate.
	 * @param {*} expectedResult The expected result. */
	constructor(name, group, code, expectedResult) {
		if (!name) throw Error('Invalid name for test "' + name + '"');
		this.name = name;  this.code = code; 
		this.expectedResult = expectedResult;
		this.group = group; if (group) group.add(this);
	}

	/** Runs the test. 
	 * @returns A boolean value with the validity of the test. */
	run() {

		// Write the name of the test
		TestEnvironment.instance.log(this.name + ':', 2);

		// Execute the given code
		let result = '', stack = '', valid = false, 
		expected = this.expectedResult;

		try { 
			result = this.code();
		}
		catch (e) { 
			result = 'ERROR: ' + e.message; 
			if (!result.startsWith(expected)) {
				TestEnvironment.instance.log(stack = e.stack);
			}
		}

		if (expected != undefined) {
			if (result == undefined) result = 'Undefined Result';
			else if (typeof expected == 'object') {
				for (let key in expected) {
					valid == (expected[key] == result[key]);
					if (valid == false) break;
				}
			}
			else if (isNaN(expected)) valid = isNaN(result);
			else valid = result === expected;
		} else if (!result) valid = true;
		else valid = !result.toString().toLowerCase().startsWith('error');

		// Convert the expected and result values into human readable text
		if (typeof expected != 'string') expected = JSON.stringify(expected);
		else expected = '"' + expected + '"'
		
		if (result == undefined) result = undefined;
		else if (typeof result == 'object') {
			result = result.toString();
			if (!result) result = JSON.stringify(result);
		}
		else if (typeof result != 'string') {
			result = JSON.stringify(result);
		} else if (result && result[0] != '{' && result[0] != '[' && 
			!result.startsWith('ERROR'))
			result = '"' + result + '"';


		if (valid) TestEnvironment.instance.log('OK' + 
			(result!== undefined? ': ' + result: ''), 1, 'green');
		else {
			if (TestConsole) TestConsole.instance.display(true);
			TestEnvironment.instance.log('ERROR: ' + (expected? 'Expected: ' + 
				expected + '': '') + (result? ' Result: ' + result : ''), 1, 'red');
		}

		return valid;
	}
}
