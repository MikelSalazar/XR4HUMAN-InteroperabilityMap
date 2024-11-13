/*****************************************************************************
 * XR4HUMAN Knowledge Graph: Build System.
 * A basic NodeJS script to build the different distributables of the project.
 *****************************************************************************/

// -------------------------------------------------------------------- IMPORTS
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'node:child_process'


// ----------------------------------------------------------- GLOBAL VARIABLES

// Get the current file name and folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the path to the project root folder
let verbose = true, filePaths = [], 
	projectId = 'XR4HUMAN.InteroperabilityMap', projectVersion = '0.7.', 
	projectAuthors = 'Mikel Salazar & Alina Kadlubsky', 
	projectName = 'XR4HUMAN Interoperability Map',
	rootFolderPath = path.join(__dirname, '../'), 
	sourcesFolderPath = path.join(rootFolderPath, 'sources/'), 
	outputFolderPath = path.join(rootFolderPath, 'builds/'), 
	temporalFolderPath = path.join(outputFolderPath, 'temporal/'), 
	modulesFolderPath = path.join(outputFolderPath, 'modules/'), 
	mainSourceFilePath = path.join(sourcesFolderPath, 'KnowledgeGraph.ts');
	

// ---------------------------------------------------------- UTILITY FUNCTIONS

/** Reads a text file.
 * @param filepath The path to the text file.
 * @returns The text data. */
function readFile(filepath) { 
	return fs.readFileSync(filepath, { encoding: 'utf-8' }); 
}


/** Writes a text file.
 * @param filepath The path to the text file.
 * @param data the text data. */
function writeFile(filepath, data){
	let folderPath = path.dirname(filepath);
	if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, {recursive: true});
	fs.writeFileSync(filepath, data, { encoding: 'utf-8' });
}

/** Processes the source files.
 * @param {*} filePath The file path. */
function processTypeScriptFile(filePath) {
	let sourceFilePath = path.join(sourcesFolderPath, filePath + '.ts');
	if (verbose) console.log('    Processing: ' + filePath + '.ts');
	let data = readFile(sourceFilePath);

	// Process the file line by line
	let lines = data.split('\n'), lineIndex, lineCount = lines.length;
	for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
		let line = lines[lineIndex], l = line.trim();
		if (l.length == 0) line = '////';	// Add a special comment for empty lines
		lines[lineIndex] = line;
	}
	data = lines.join('\n');

	// Save a copy of the file in a temporal folder
	let temporalFilePath = path.join(temporalFolderPath, filePath + '.ts');
	writeFile(temporalFilePath, data);
}

/** Processes the source files. */
function processMainFile() {
	let data = readFile(mainSourceFilePath); 
	let lines = data.split('\n'), lineIndex, lineCount = lines.length;
	for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
		let line = lines[lineIndex], l = line.trim();
		if (l.startsWith('export') && l.includes(' from ')) {
			let delimiter = '\'', end = line.lastIndexOf(delimiter);
			if (end <= 0) { delimiter = '"'; end = line.lastIndexOf('"'); }
			if (end > 0) {
				let start = line.slice(0, end).lastIndexOf(delimiter);
				let exportPath = line.slice(start + 1, end);
				if (exportPath.startsWith('./')) 
					exportPath = path.join(sourcesFolderPath, exportPath);
				else if (exportPath.startsWith('../')) 
					exportPath = path.join(folderPath, exportPath);
				else continue;
				exportPath = path.relative(sourcesFolderPath, exportPath);
				
				// Remove the extension
				let extensionPoint = exportPath.lastIndexOf('.');
				if (extensionPoint >= 0) exportPath = 
					exportPath.substring(0, extensionPoint);
				if (!filePaths.includes(exportPath)) filePaths.push(exportPath);
			}
		}
	}

	// Add the main file at the end
	filePaths.push(path.parse(mainSourceFilePath).name);
}

/** Processes a Javascript file.
 * @param filePath The path of the Javascript file. */
function processJavascriptFile(filePath, links = false, exports = false) {

	let relativePath = filePath + '.js';
	if (verbose) console.log('    Processing: ' + relativePath);
	let data = readFile(path.join(temporalFolderPath, relativePath));

	// Process the file line by line
	let lines = data.split('\n'), lineIndex, lineCount = lines.length;
	for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
		let line = lines[lineIndex], l = line.trim();

		// Remove links to external declarations
		if (!links && (l.startsWith('import') || l.startsWith('export')) &&
			l.includes(' from ')) line = '';

		// Remove module exports
		if (!exports && l.startsWith('export') && !l.includes(' from ')) {
			line = line.replace('export', '      ');
		}

		if (l == '////') line = '';					// Remove special comments
		else line = line.replace(/    /g, '\t');	// Replace tabs
		lines[lineIndex] = line;
	}
	data = lines.join('\n');
	writeFile(path.join(modulesFolderPath, relativePath), data);
}


/** Processes a source map file.
 * @param originalFilePath The path of the original source map file. 
 * @param processedFilePath The path of the processed source map file.
 * @param The file path to the source file. */
function processSourceMapFile(originalFilePath, processedFilePath, sourcePath) {

	// Read the JSON data 
	let data = JSON.parse(readFile(originalFilePath));
	
	// Check the source files
	if (sourcePath) {
		let sourceIndex, sourceCount = data.sources.length;
		for (sourceIndex = 0; sourceIndex < sourceCount; sourceIndex++)
			data.sources[sourceIndex] = sourcePath + data.sources[sourceIndex];
	}
	
	// Create a more readable version of the 
	data = JSON.stringify(data, null, '\t');
	let lines = data.split('\n'), lineIndex, lineCount = lines.length;
	for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
		if (lines[lineIndex].endsWith('[')) {	// Compress arrays
			let value; do {
				value = lines[lineIndex+1].trim();
				lines[lineIndex] += ' ' + value;
				lines.splice(lineIndex+1, 1); lineCount--;
			} while (!value.startsWith(']'));
		}
	}
	writeFile(processedFilePath || originalFilePath, lines.join('\n'));
}


/** Combines multiple files into one.
 * @param {*} inputFilePaths The paths of the input files.
 * @param {*} outputFilePath The paths of the output files. */
function combineFiles (inputFilePaths, outputFilePath) {
	let data = '';
	for (let filePath of inputFilePaths) 
		data += '// '+'*'. repeat(72-filePath.length)+' '+filePath + '.js\n\n' +
			readFile(path.join(modulesFolderPath, filePath + '.js')) + '\n\n';
	
	data = data.replace(/\/\/# sourceMappingURL.*/g, '')
	writeFile(outputFilePath, data);
}


// ---------------------------------------------------------------- ENTRY POINT

// Show a message on console to indicate the start of the process
console.log('BUILDING ' + projectName + ' (' + projectVersion + ')');

// Clean the builds folder
console.log(' Cleaning the output directory...');
// if (fs.existsSync(outputFolderPath)) {
// 	let paths = fs.readdirSync(outputFolderPath);
// 	paths.forEach(filePath => {
// 		filePath = path.join(outputFolderPath, filePath);
// 		fs.rmSync(filePath, { recursive: true });
// 	});
// } else fs.mkdirSync(outputFolderPath);

// Create the temporal folder
if (!fs.existsSync(temporalFolderPath)) fs.mkdirSync(temporalFolderPath);

// Create a temporal copy of the files for the transpilation
console.log('  Reading main file...');
processMainFile(mainSourceFilePath);

// Create a temporal copy of the files for the transpilation
console.log('  Processing Typescript files...');
for(let filePath of filePaths) processTypeScriptFile(filePath);

// Transpile the Typescript files
console.log('  Transpiling Typescript files...');
let typescriptCommand = 'tsc ' +
	' --target es2020' +
	' --sourceMap' +
	' --moduleResolution node' + 
	' --outDir ' + temporalFolderPath + 
	' ' + filePaths.join('.ts ') + '.ts';
if (verbose) console.log(typescriptCommand);
execSync(typescriptCommand, {cwd: temporalFolderPath, stdio: 'inherit'});

// Process the source map files and copy them to
console.log('  Processing Source Map files...');
for (let filePath of filePaths) 
	processSourceMapFile( path.join(temporalFolderPath, filePath + '.js.map'),
		path.join(modulesFolderPath, filePath + '.js.map'),
		path.dirname(path.relative(path.join(outputFolderPath, filePath),
			path.join(sourcesFolderPath, filePath))) + '\\');

// Creating the CommonJS file
console.log('  Creating the CommonJS version...');
for (let filePath of filePaths) processJavascriptFile(filePath, false, false);

combineFiles(filePaths, path.join(outputFolderPath, projectId + '.js'));

let terserCommand = 'terser --source-map -o ' + '../' + projectId + '.min.js' + 
	' ' + filePaths.join('.js ') + '.js';
if (verbose) console.log(terserCommand);
execSync(terserCommand, {cwd: modulesFolderPath, stdio: 'inherit'});
processSourceMapFile(path.join(outputFolderPath, projectId + '.min.js.map'),
	undefined, 'modules\\');

// Creating the module
console.log('  Creating the ES6 Module version...');
for (let filePath of filePaths) processJavascriptFile(filePath, false, true);

let moduleFileName = projectId + '.module.js';
let terserModuleCommand = 'terser --module --source-map -o ' + 
	'../' + moduleFileName + ' ./' + filePaths.join('.js ./') + '.js';
if (verbose) console.log(terserModuleCommand);
execSync(terserModuleCommand, {cwd: modulesFolderPath, stdio: 'inherit'});
processSourceMapFile(path.join(outputFolderPath, moduleFileName + '.map'), 
	undefined, 'modules\\');

// Creating the individual modules
console.log('  Processing Javascript files for modules...');
for (let filePath of filePaths) processJavascriptFile(filePath, true, true);

// Remove the temporal folder
console.log('  Cleaning temporal files...');
fs.rmSync(temporalFolderPath, { recursive: true });

// Create the output files
console.log('  Creating Output files...');
execSync('node ./packer.mjs', {cwd: __dirname, stdio: 'inherit'});


// Show a message on console to indicate the successful end of the build
console.log('BUILD PROCESS COMPLETED');