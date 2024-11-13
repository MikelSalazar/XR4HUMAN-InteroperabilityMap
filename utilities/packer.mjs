/*****************************************************************************
 * XR4HUMAN Knowledge Graph: Packager
 * A basic NodeJS script to create the final project files.
 *****************************************************************************/

// -------------------------------------------------------------------- IMPORTS
import fs, { writeFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { KnowledgeGraph } from '../builds/XR4HUMAN.KnowledgeGraph.module.js';
import { KnowledgeGraph } from '../builds/modules/KnowledgeGraph.js';
import { Script } from 'node:vm';
import { execSync } from 'node:child_process';
import { exit } from 'node:process';


// ----------------------------------------------------------- GLOBAL VARIABLES

// Get the current file name and folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the path to the project root folder
let verbose = true, filePaths = [], 
	projectId = 'XR4HUMAN.InteroperabilityMap', projectVersion = '0.01.', 
	outputFileName = 'XR4HUMAN.InteroperabilityMap',
	projectName = 'XR4HUMAN Interoperability Map',
	projectAuthors = 'Mikel Salazar, Alina Kadlubsky', 
	rootFolderPath = path.join(__dirname, '../'), 
	resourcesFolderPath = path.join(rootFolderPath, 'resources/'), 
	faviconFilePath = path.join(resourcesFolderPath, 'XR4HUMAN-favicon.png'), 
	logoFilePath = path.join(resourcesFolderPath, 'XR4HUMAN-logo.svg'), 
	dataFilePath = path.join(resourcesFolderPath, 'InteroperabilityMap.jsonc'), 
	buildsFolderPath = path.join(rootFolderPath, 'builds/'), 
	distributablesFolderPath = path.join(rootFolderPath, 'distributables/'), 
	scriptFilePath = path.join(buildsFolderPath, projectId + '.js'),
	minifiedFilePath = path.join(buildsFolderPath, projectId + '.js'),
	svgFilePath = path.join(distributablesFolderPath, outputFileName + '.svg'),
	plainSvgFilePath = path.join(distributablesFolderPath, outputFileName + '.plain.svg'),
	debugHtmlFilePath = path.join(distributablesFolderPath, outputFileName + '.debug.html'),
	htmlFilePath = path.join(distributablesFolderPath, outputFileName + '.html');
	

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

/** Reads an image.
 * @param filepath The path to the image file file.
 * @returns The image data (in base 64).. */
function readImage(filepath) {
	return fs.readFileSync(filepath, { encoding: 'base64' }); 
}


/** Gets the shape data from a SVG file 
 * @param {*} imageData The image data.
 * @param {*} tabs The number of tabs.
 * @returns The resulting shape data. */
function getShapeData(filepath, tabs = 0) {

	// Get only the right lines
	let imageData = fs.readFileSync(filepath, { encoding: 'utf-8' }),
		invalidTags = ['?xml','svg', '/svg', 'title'], fileTabs = 0,
		lines = imageData.split('\n'), lineIndex, lineCount = lines.length;
	for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
		let line = lines[lineIndex], l = line.trim(), exclude = false;
		
		// If the line is empty, remove it
		if (l == '') { lines.splice(lineIndex, 1); lineIndex--; lineCount--; }
		
		// If the line starts with an invalid tag, remove it
		for (let invalidTag of invalidTags) 
			if (l.startsWith('<' + invalidTag)) { exclude = true; break; }
		if (exclude) { lines.splice(lineIndex, 1); lineIndex--; lineCount--; }
		
		// Count the number of tabs
		let lineTabs = 0;
		for (let char in line) if (char == '\t') lineTabs++; else break;
		if (fileTabs < lineTabs) fileTabs = lineTabs;
	}

	// Insert tabs, if necessary
	let tabsToInsert = tabs-1;
	if (tabsToInsert > 0)
		for (lineIndex = 0; lineIndex < lineCount; lineIndex++)
			lines[lineIndex] = '\t'.repeat(tabsToInsert) + lines[lineIndex];

	// Return the Valid lines
	return lines.join('\n');
}

// ---------------------------------------------------------------- ENTRY POINT


// Read the javascript files
let scriptData = readFile(scriptFilePath);
let minifiedData = readFile(minifiedFilePath);

// Obtain the resources
let faviconFileData = readImage(faviconFilePath),
	logoFileData = getShapeData(logoFilePath, 2),
	dataFileData = readFile(dataFilePath);

// Remove the comments and  trailing commas from the JSONC files
dataFileData = dataFileData.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
dataFileData = dataFileData.replace(/\,\s*\n(\s*[}|\]])/gm, '\n$1');

// Create the initial SVG data using the very same file we are going to embed
let graph = new KnowledgeGraph(JSON.parse(dataFileData)), tabulate = true,
	inputData = graph.ui.component.toString().replace(/&/g, '&amp;').split('\n'), 
	svgInputData = [...inputData], svgOutputData = [], htmlOutputData = [],
	svgStartTag = svgInputData.shift(), svgEndTag = svgInputData.pop(),
	defsData = [];

// let colors = [ 
// 	{ key:"foreground_color", value: "#ffffff"},
// 	{ key:"background_color", value: "#001122"}
// ];

// // Create the defs section with the resources
// defsData.push('\t<defs>');
// for (let color of colors)
// 	defsData.push('\t\t<linearGradient id="' + color.key + '">' +
// 		'<stop stop-color="' + color.value + '" stop-opacity="1"/>' +
// 		'</linearGradient>'); 
// defsData.push(logoFileData);
// defsData.push('\t</defs>');



// // Write the plain SVG file
svgOutputData.push(svgStartTag);
// svgOutputData.push(... defsData); 
svgOutputData.push(... svgInputData);
svgOutputData.push(svgEndTag);
writeFile(plainSvgFilePath, svgOutputData.join('\n'));


// Write the Interactive SVG file
svgOutputData.pop();
svgOutputData.push('\t<script>');
svgOutputData.push('\t// <![CDATA['); // Necessary marker, do not delete
svgOutputData.push('\n\n// Embed or reference the Knowledge graph code');
svgOutputData.push(minifiedData);
svgOutputData.push('\n\n// Create the data of the Knowledge graph');
svgOutputData.push('let KnowledgeGraphData = ' + dataFileData);
svgOutputData.push('\n\n// Initialize the Knowledge graph');
svgOutputData.push('let graph = KnowledgeGraph.init(KnowledgeGraphData);');
svgOutputData.push('\t// ]]>');
svgOutputData.push('\t</script>');
svgOutputData.push(svgEndTag);
writeFile(svgFilePath, svgOutputData.join('\n'));


// Write the HTML file
htmlOutputData.push('<!DOCTYPE html>');
htmlOutputData.push('<html>');
htmlOutputData.push('\t<head>');
htmlOutputData.push('\t\t <meta charset="UTF-8">');
htmlOutputData.push('\t\t<meta name="author" content="'+ projectAuthors + '">');
htmlOutputData.push('\t\t<meta name="viewport" content="width=device-width,' +
	' initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />');
htmlOutputData.push('\t\t<title>' + projectName + '</title>');
htmlOutputData.push('\t\t<link rel="icon" type="image/x-icon" '+
	'href="data:image/x-icon;base64,' + faviconFileData + '" >'); // Embedded favicon
htmlOutputData.push('\t</head>');
htmlOutputData.push('\t<body>');
for (let svgLine of svgOutputData) { // Embedded SVG code
	if (!tabulate && svgLine.trim().startsWith('</script>')) tabulate = true;
	htmlOutputData.push((tabulate?'\t\t':'') + svgLine);
	if (tabulate && svgLine.trim().startsWith('<script')) tabulate = false;
}
htmlOutputData.push(svgEndTag);
htmlOutputData.push('\t</body>');
htmlOutputData.push('</html>');
writeFile(htmlFilePath, htmlOutputData.join('\n'));


// Write the debug HTML file
let codeLine = htmlOutputData.indexOf('\t// <![CDATA['); // Use the marker
htmlOutputData[codeLine - 1] = '\t\t\t<script type="module">';
htmlOutputData[codeLine + 2] =
	'import { KnowledgeGraph } from "../builds/modules/KnowledgeGraph.js"';
writeFile(debugHtmlFilePath, htmlOutputData.join('\n'));


// Generate the PNG and PDF versions of the Knowledge Graph
// let inkscapeCommand = 'inkscape --export-type="png" ' + '-h 2100 ' +
// 	outputFileName + '.svg ';
// execSync(inkscapeCommand, {cwd: distributablesFolderPath, stdio: 'inherit'})

// inkscapeCommand = 'inkscape --export-type="pdf" ' + outputFileName + '.svg ';
// execSync(inkscapeCommand, {cwd: distributablesFolderPath, stdio: 'inherit'})

// Show a message on console to indicate the successful end of the build
console.log('Package created');

