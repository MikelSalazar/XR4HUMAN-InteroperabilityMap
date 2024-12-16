import { Node } from "../../data/Node.js"
import { NodeType } from "../../data/NodeType.js"
import { Color } from "../../data/types/complex/Color.js"
import { Component } from "../Component.js";
import { Animation } from "../Animation.js";
import { Widget } from "../Widget.js";
import { UserInterface } from "../UserInterface.js";
import { KnowledgeGraph } from "../../KnowledgeGraph.js";


/** Defines a TransitMap Widget */
export class TransitMap extends Widget {

	// --------------------------------------------------------------- METADATA

	/** The type metadata of the TransitMap class. */
	static type = new NodeType('TransitMap', 'transit_map', Widget.type, 
		TransitMap);


	// ------------------------------------------------------- PROTECTED FIELDS

	/** The map of TransitMap. */
	protected _map: Widget;


	/** The named list of the lines of the TransitMap. */
	protected _lines: Record<string, any>;

	/** The sorted list of the lines of the TransitMap. */
	protected _linesList: any[];

	/** The legend of the lines of the TransitMap. */
	protected _linesLegend: Widget;

	/** The items of the legend of the lines of the TransitMap. */
	protected _linesLegendItems: Component;


	/** The named list of the connections of the TransitMap. */
	protected _connections: Record<string, any>;
	
	/** The sorted list of the connections of the TransitMap. */
	protected _connectionsList: any[];

	/** The element of the connections of the TransitMap. */
	protected _connectionsElement: Component;


	
	/** The named list of the stations of the TransitMap. */
	protected _stations: Record<string, any>;

	/** The sorted list of the stations of the TransitMap. */
	protected _stationsList: any[];

	/** The element of the stations of the TransitMap. */
	protected _stationsElement: Component;

	/** The element of the station information of the TransitMap. */
	protected _infoElement: Component;
		

	// ------------------------------------------------------------ CONSTRUCTOR

	/** Initializes a new SwitchWidget instance.
	 * @param name The name of the instance.
	 * @param parent The parent node.
	 * @param type The type of node. */
	constructor(name: string, parent: Node, data?: any) {

		// Call the parent constructor
		super(name, parent, data);

		// Create the map 
		this._map = new Widget('map', this.widgets); 
		let c = this._map.component;
		this._connectionsElement = new Component('g', c, { id: 'connections' });
		this._stationsElement = new Component('g', c, { id: 'stations' });
		this._infoElement = new Component('g', c, { id: 'info'} );
		this._map.pivot.value = 'center'; this._map.anchor.value = 'movable';
	
		// Create the legends
		let width = this._width.value, height = this._height.value,
			vmin = width < height? width: height, legendSize = vmin / 10,
			fontFamily = 'arial';
		this._linesLegend = new Widget('LinesLegend', this.widgets, { 
			width: legendSize, height: legendSize, anchor: 'bottom-left', 
			position: [10, -10], background: '#888888', radius: 10});
		new Component('text', this._linesLegend.component, {
			id: 'LinesLegendTitle', x: 10, y: 20, font_family: fontFamily, 
			font_size: 15, font_weight: "bold", fill: 'url(#foreground_color)'}, 
			'Lines (Stakeholders):', ()=> { this.selectLine()});
		this._linesLegendItems = new Component('g', 
			this._linesLegend.component);
		this._linesLegend.background.setAttribute('fill_opacity', 0.4);

		// Connect the reset view event
		let ui = this.ancestor<UserInterface>(UserInterface);
		ui.onViewReset.push(this.resetView.bind(this));

		// Debug mode with the plus/minus keys
		if (KnowledgeGraph.environment == 'browser') {
			document.onkeydown = (e) => { 
				if (this.debug == undefined) this.debug = 0;
				switch(e.key) {
					case '+': 
						if (this.debug < this._stationsList.length)this.debug++; 
						this.update(true); 
						break;
					case '-': 
						if (this.debug > 0) this.debug--;
						this.update(true); 
						break;
				}
			 };
		}
	}


	// --------------------------------------------------------- PUBLIC METHODS

	/** Updates the TransitMapView instance.
	 * @param forced Whether to force the update or not. */
	update(forced: boolean = false) {

		// If the node is already updated, do nothing (unless forced)
		if (this._updated && !forced) return;

		// Get the model of the KnowledgeGraph
		let model = this.ancestor<KnowledgeGraph>(KnowledgeGraph).model;
		let fontFamily = 'Arial';
		
		// If the model has not been updated, skip the creation of 
		if (forced || !this._updateTime || this._updateTime<=model.updateTime) {

			// Clean the current elements
			this._connectionsElement.clear();
			this._stationsElement.clear();
			this._infoElement.clear();

			// Create the data structures
			this._stations = {}; this._stationsList = [];
			this._connections = {}; this._connectionsList = [];

			// Convert the domains into districts
			let districtIndex = 0, districtColors = ['#ef1de5', '#037e8e', 
				'#00abcd','#620d7d', '#b206f9', '#082ebf','#C999D3', '#F2E6F4',
				'#EBB3F3','#F8E6FB','#B3C3D4','#E6EBF1','#BFFBFF','#EAFEFF'];
			for (let d of model.domains) {
				let district: any = { name: d.name, title: d.title.value,
					description: d.description.value, stations: [], 
					color: districtColors[districtIndex]};
				for (let c of d.classes) district.stations.push(c.name);

				// Increase the counter
				districtIndex++;
			}

			// Convert the classes into stations
			for (let c of model.classes) {
				let station: any = { name: c.name, title: c.title.value, 
					description: c.description.value, lines: [], districts:[],
					connections: {}, x: 1000, y: 1000, visible: true};
				for(let lineName of c.relations.references) 
					station.lines.push(lineName);
				for(let district of c.domains.references) 
					station.districts.push(district);

				// Create the station group element
				station.element = new Component('g', this._stationsElement, {
					id: station.name });

				// The main element is a circle
				new Component('circle', station.element, {
					r: 10, stroke: 'url(#foreground_color)', stroke_width: '2', 
					fill: 'url(#background_color)'});
				
				// Create a label with a shadow
				let text = station.title, lines = text.split('\n'),
					fontSize = 10, lineSeparation = 15, 
					lineOffset = -5 - lineSeparation * lines.length;
				let labelShadow = new Component('text', station.element, { 
					font_family: fontFamily, font_size: fontSize, 
					font_weight: "bold", text_anchor: "middle",
					stroke: 'url(#background_color)', stroke_width: 2});
				let label = new Component('text', station.element, { 
					font_family: fontFamily, font_size: fontSize, 
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#foreground_color)'});
				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					let tp = { x: 0, y: lineOffset}, line = lines[lineIndex];
					new Component('tspan', labelShadow, tp, line);
					new Component('tspan', label, tp, line);
					lineOffset += lineSeparation;
				}

				// Create the element with the information of the station
				station.infoElement = new Component('g', this._infoElement);
				if (KnowledgeGraph.environment == 'node') 
					station.infoElement.setAttribute('display', 'none');
				let w = 200, r = 10; 
				text = station.description; lines = text.split('\n');
				lineOffset = 15;
				new Component('rect', station.infoElement, { 
					x: -w/2, y: 0, width: w, height: w/2, rx: r, ry: r,
					font_family: fontFamily, font_size: fontSize, 
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#background_color)',
					stroke: 'url(#foreground_color)', stroke_width: 2
				})
				let description = new Component('text', station.infoElement, { 
					font_family: fontFamily, font_size: fontSize, 
					font_weight: "bold", text_anchor: "middle",
					fill: 'url(#foreground_color)'});
				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					let tp = { x: 0, y: lineOffset}, line = lines[lineIndex];
					new Component('tspan', description, tp, line);
					lineOffset += lineSeparation;
				}

				// Create an event
				if (KnowledgeGraph.environment == 'browser') {
					let e = station.infoElement; e.enabled = false;
					e.onclick = station.element.onclick = () => {
						e.enabled = !e.enabled;
						if(e.enabled) console.log(station);
					}
				}
	
				// Add the element to the lists
				this._stations[station.name] = station; 
				this._stationsList.push(station)

				if (this.debug && this._stations.count >= this.debug) 
				{ console.log(this.debug); break; }
			}
			this._stationsList.sort((a,b) => b.lines.length - a.lines.length);
			// console.log('Sorted stations:', this._stationsList);

			// Convert the relationship into lines
			let lineIndex = 0, lineColors = ['#ef1de5', '#037e8e', '#00abcd',
				'#620d7d', '#b206f9', '#082ebf', '#a59dcc', '#582bb1'],
				lineWidths = [2,2,2,2,2,2,2,2];
			this._lines = {}; this._linesList = [];
			for (let relation of model.relations) {
				let line: any = { name: relation.name, 
					title: relation.title.value, 
					description: relation.description.value, 
					color: lineColors[lineIndex], 
					stations: [], connections: [], 
					width: lineWidths[lineIndex], circular: false
				};
				for(let stationName of relation.classes.references) 
					line.stations.push(stationName);
				line.stations.sort((a:any, b: any) => this._stations[b]
					.lines.length - this._stations[a].lines.length);
				this._lines[relation.name] = line; 
				this._linesList.push(line); 	
			
				// Increase the counter
				lineIndex++;
			}
			this._linesList.sort((a,b) => b.stations.length-a.stations.length);
			// console.log('Sorted lines:', this._linesList);

			// Update the legends
			this.updateLegends();


			// Create the grid
			this.createGrid();

			// Recenter the view
			this.resetView((KnowledgeGraph.environment == 'browser')? 0.5: 0);

			// Update the elements
			this.updateStations();
			this.updateConnections();

			console.log("Updated TransitMap")
		}


		
		// Call the base class method
		super.update(forced);
		
		return true;
	}


	// -------------------------------------------------------- PRIVATE METHODS


	/** Positions the stations using a regular grid.
	 * @param rows The number of rows of the grid.
	 * @param columns The number of columns of the grid.
	 * @param cellSize The size of the cells of the grid. */
	private createGrid(rows = 5, columns = 10, cellSize = 100) {
		
		// Create the grid to position the stations more easily
		let grid = [], cx = Math.floor(columns/2), cy = Math.floor(rows/2);
		for (let x = 0; x < columns; x++) {
			grid[x] = []; for (let y = 0; y < rows; y++) grid[x][y] = undefined;
		}

		// Checks the position of a point relative to a segment
		function ccw(A: any, B: any, C: any): boolean {
			return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x)
		}

		// Calculates if two segments intersect
		function intersect(A: any, B: any, C: any, D: any): boolean {
			return ccw(A, C, D) != ccw(B, C, D) && ccw(A, B, C) != ccw(A, B, D);
		}

		// Position the stations and create the connections
		let remainingStations = [... this._stationsList], stations = [], 
			lines = [];
		this._connections = {}; this._connectionsList = []; 
		while (remainingStations.length > 0) {
			let station = remainingStations.shift(), options = [];
			for (let x = 0; x < columns; x++) {
				for (let y = 0; y < rows; y++) {
					if (grid[x][y]) continue;
					
					// Manhattan distance to the center of the grid
					let dx = cx - x, dy = cy - y, 
						connectionDistance = Math.abs(dx) + Math.abs(dy),
						value = connectionDistance; 

					let links = [];
					for (let line of station.lines) {
						let bestStation, bestValue = 100000;
						for (let previousStation of stations) {
							if (previousStation.lines.includes(line)) {
								let cdx = previousStation.x - x,
									cdy = previousStation.y - y,
									connectionDistance = 
										Math.abs(cdx) + Math.abs(cdy); 
								if (bestValue > connectionDistance) {
									bestValue = connectionDistance;
									bestStation = previousStation;
								}
							}
						}
						if (!bestStation) continue;
						links.push({station: bestStation.name, line: line});
						// value -= bestValue / 10;
						// if (station.districts[0] == bestStation.districts[0])
						// 	value -= 0.01;

						for (let line of lines) {
							if (intersect(line.a, line.b, {x: x, y: y}, 
								{ x: bestStation.gridX, y: bestStation.gridY }))
								value -= 0.1;
						}
						
					}
					options.push({ x:x, y:y, v: value, links: links });
					// console.log(links)
				}
			}
			
			options.sort((a,b) => a.v - b.v);
			let bestGridPosition = options[0];
			grid[bestGridPosition.x][bestGridPosition.y] = station;
			station.gridX = bestGridPosition.x;
			station.gridY = bestGridPosition.y;

			for (let link of bestGridPosition.links) {

				// Check if a connection with the linked station exists
				let connectionName = station.name + '-' + link.station,
					connection = this._connections[connectionName]
				
				// If not, create it
				if (!connection) {
					connection = { a: station.name, b: link.station,
						lines:[], width: 0, component: new Component('g', 
							this._connectionsElement, {id: connectionName})}
					this._connections[connectionName] = connection;
					this._connectionsList.push(connection);
					let o = station, d = this._stations[link.station];
					lines.push({ a: {x: o.gridX, y: o.gridY },
						b: { x: d.gridX, y: d.gridY } });
				}

				// Add the line to the connection
				let line = this._lines[link.line];
				new Component('polyline', connection.component, {
					id: connectionName + '-' + link.line, fill: 'none',
					stroke: line.color, stroke_width: line.width
				});
				connection.width += line.width; 
				connection.lines.push(line); line.connections.push(connection);
			}
			stations.push(station);
		}

		// Position the stations
		let stationIndex = 0, 
			maxStation = typeof this.debug == 'number'? this.debug : 0;
		for (let station of stations) {
			station.x = 1000; station.y = 1000; station.visible = false;
			if(maxStation && ++stationIndex > maxStation) {
				station.gridX = station.gridY = undefined;
				continue;
			}
			station.x = (station.gridX - cx) * cellSize;
			station.y = (station.gridY - cy) * cellSize;
			station.visible = true;
		}
	}


	/** Updates the stations. */
	private updateStations() {
		for (let station of this._stationsList) {
			let display = station.visible? undefined : 'none';
			station.element.setAttribute('display', display);
			if (!station.visible) continue;
			let transform = 'translate(' + station.x + ', ' + station.y + ')';
			station.element.setAttribute('transform', transform);
			station.infoElement.setAttribute('transform', transform);
		}
	}

	
	/** Updates the connections. */
	private updateConnections() {
		for (let connection of this._connectionsList) {
			let a = this._stations[connection.a], 
				b = this._stations[connection.b],
				x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y, xd = x2 - x1, 
				yd = y2 - y1, xa = Math.abs(xd), ya = Math.abs(yd); 

			// Check the current state of the connection
			if (x1 == x2 && y1 == y2) continue;
			if (!a.visible || connection.lines == 0) continue;
	

			// Generate the points in a 45 degree grid
			let points: any[] = [{x: x1, y: y1}];
			if (xd != 0 && yd != 0 && xa != ya) {
				let d = (xa < ya? xa : ya) / 2, xs = Math.sign(xd), 
					ys = Math.sign(yd);
				points.push( { x: x1 + d * xs, y: y1 + d * ys },
						{ x: x2 - d * xs, y: y2 - d * ys } );
			} 
			points.push({x: x2, y: y2});

			// Draw the points
			let offset = -connection.width/2, ox = y2-y1, oy = -(x2-x1);
			let l = Math.sqrt(ox * ox + oy * oy); ox /= l; oy /= l;
			for (let component of connection.component.children) {
				offset += parseFloat(component.getAttribute('stroke-width'));
				let p = ''
				for (let point of points) p += (p.length? ' ': ' ')+
					(point.x + ox * offset) + ',' + (point.y + oy * offset)
				component.setAttribute('points',p);
			}
		}
	}


	/** Updates the legends. */
	private updateLegends() {
		let fontFamily = 'arial', linesLegendItems = this._linesLegendItems;
		linesLegendItems.clear();
		let lineIndex = 0; this._linesLegend.width.value = 200;
		this._linesLegend.height.value = 30 + 20 * (this._linesList.length);
		for (let line of this._linesList) {
			let group = new Component('g', linesLegendItems, { id: line.name, 
				transform: 'translate(10, ' +( 30 + 20 * lineIndex++) +')'},
				undefined, () => { this.selectLine(line.name)});
			new Component('rect', group, {fill: line.color, 
				width: 20, height: 10});
			new Component('text', group, {fill: 'url(#foreground_color)',
				x: 40, y: 10, font_family: fontFamily, font_size: 14 }, line.title);
		}
	}


	/** Selects a particular line.
	 * @param lineName The name of the line to select. */
	selectLine(lineName?: string) {
	
		// If no line is selected, make all of them visible
		if (!lineName) {
			for (let connection of this._connectionsList)
				for (let polyline of connection.component.children)
					polyline.setAttribute('stroke_opacity', 1);
			return;
		}

		// Show the selected line and hide the rest
		let selectedLine = this._lines[lineName];
		if (!selectedLine) throw Error('Invalid line: ' + lineName);
		let c = selectedLine.color;
		for (let line of this._linesList)
			for (let connection of line.connections)
				for (let polyline of connection.component.children)
					polyline.setAttribute('stroke_opacity',
						(polyline.getAttribute('stroke') == c)? 1 : 0.1);
	}


	/** Reset the view.
	 * @param duration The duration of the animation. */
	resetView(duration = 0.5) { 

		// Get the bounding box with a
		let v = 10000, minX = v, maxX = -v, minY = v, maxY = -v, border = 100;
		for (let station of this._stationsList) {
			if (!station.visible) continue;
			if (minX > station.x) minX = station.x;
			if (maxX < station.x) maxX = station.x;
			if (minY > station.y) minY = station.y;
			if (maxY < station.y) maxY = station.y;
		}
		minX -= border; minY -= border; maxX += border; maxY += border;
		
		// Find the center and the right scale
		let scaleX = this._width.value / (maxX - minX),
			scaleY = this._height.value / (maxY - minY),
			scale = (scaleX < scaleY)? scaleX: scaleY,
			cX = (minX + (maxX-minX) / 2) * scale, 
			cY = (minY + (maxY-minY) / 2) * scale;

		// Find the vcenter and the right scale
		let map = this._map, p = map.position.getValues(), s = map.scale.value;
		if  (duration > 0) {
			new Animation((t : number) => { 
				this._map.scale.value = (1-t) * s + t * scale;
				this._map.position.setValues((1-t)*p.x+t*-cX, (1-t)*p.y+t*-cY);
				// console.log(this._map.position.toString())
			}, undefined, 0, 1, 0, duration, true);
		} else {
			this._map.scale.value = scale;
			this._map.position.setValues(-cX, -cY);
		}
	}

}