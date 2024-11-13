import { Node } from "../../data/Node.js"
import { NodeType } from "../../data/NodeType.js"
import { Color } from "../../data/types/complex/Color.js"
import { Component } from "../Component.js";
import { Animation } from "../Animation.js";
import { Widget } from "../Widget.js";
import { UserInterface } from "../UserInterface.js";
import { KnowledgeGraph} from "../../KnowledgeGraph.js";


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


	/** The named list of the districts of the TransitMap. */
	protected _districts: Record<string, any>;
	
	/** The sorted list of the districts of the TransitMap. */
	protected _districtsList: any[];

	/** The element of the districts of the TransitMap. */
	protected _districtsElement: Component;

	/** The legend of the districts of the TransitMap. */
	protected _districtsLegend: Widget;

	/** The items of the legend of the districts of the TransitMap. */
	protected _districtsLegendItems: Component;


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
		this._map = new Widget('map', this.widgets,
			// { debug: true}
		); 
		let c =this._map.component;
		this._districtsElement = new Component('g', c, { id: 'districts' });
		this._connectionsElement = new Component('g', c, { id: 'connections' });
		this._stationsElement = new Component('g', c, { id: 'stations' });
		this._infoElement = new Component('g', c, { id: 'info'} );
		this._map.pivot.value = 'center'; this._map.anchor.value = 'movable';
	
		// Create the legends
		let width = this._width.value, height = this._height.value,
			vmin = width < height? width: height,legendSize = vmin / 10,
			fontFamily = 'arial';
		this._linesLegend = new Widget('LinesLegend', this.widgets, { 
			width: legendSize, height: legendSize, anchor: 'bottom-left', 
			position: [10, -10], background: '#88888844', radius: 10});
		new Component('text', this._linesLegend.component, {
			id: 'LinesLegendTitle', x: 10, y: 20, font_family: fontFamily, 
				font_size: 15, font_weight: "bold", 
				fill: 'url(#foreground_color)' }, 'Lines (Stakeholders):');
		this._linesLegendItems = new Component('g', 
			this._linesLegend.component);
		this._districtsLegend = new Widget('DistrictsLegend', this.widgets, {
			width: legendSize, height: legendSize, anchor: 'bottom-right',
			position: [-10, -10], background: '#88888844', radius: 10});
		new Component('text', this._districtsLegend.component, {
			id: 'DistrictsLegendTitle', x: 10, y: 20, font_family: fontFamily, 
				font_size: 15, font_weight: "bold", 
				fill: 'url(#foreground_color)' }, 'Districts (Domains):');
		this._districtsLegendItems = new Component('g', 
			this._districtsLegend.component);

		// Connect the reset view event
		let ui = this.ancestor<UserInterface>(UserInterface);
		ui.onViewReset.push(this.resetView.bind(this));
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
			this._districtsElement.clear();
			this._connectionsElement.clear();
			this._stationsElement.clear();
			this._infoElement.clear();

			// Create the data structures
			this._districts = {}; this._districtsList = [];
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
				district.element = new Component('path', 
					this._districtsElement, {id: district.name,	
						fill: district.color, fill_opacity: 0.4});
				for (let c of d.classes) district.stations.push(c.name);
				this._districts[district.name] = district; 
				this._districtsList.push(district)

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
				// if (station.districts.length > 1)
				// 	console.log(station.name, station.districts)

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
				
				// Create the legends

				
				// Increase the counter
				lineIndex++;
			}
			this._linesList.sort((a,b) => b.stations.length-a.stations.length);
			// console.log('Sorted lines:', this._linesList);

			// Update the legends
			this.updateLegends();

			// DEBUG position the stations in a simpler grid
			// this.createSimpleGrid();

			// Create the grid
			this.createGrid();

			// Recenter the view
			this.resetView((KnowledgeGraph.environment == 'browser')? 0.5: 0);
		}

		// Update the elements
		this.updateStations();
		this.updateDistricts();
		this.updateConnections();

		// Call the base class method
		return super.update(forced);
	}


	// -------------------------------------------------------- PRIVATE METHODS

	/** Positions the stations using a simple grid.
	 * @param columns The number of columns of the grid.
	 * @param cellSize The size of the cells of the grid. */
	private createSimpleGrid(columns: number = 5, separation: number= 200) {
		let rows = Math.round(this._stationsList.length/ columns),
			halfWidth = (columns - 1)/2, halfHeight = (rows - 1)/2,
			x = -halfWidth, y = -halfHeight;
		for (let stationName in this._stations) {
			let station = this._stations[stationName]
			station.x = x * separation; station.y = y * separation;
			x++; if (x > halfWidth) { x = -halfWidth; y++; }
		}
	}


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

		// Position the stations and create the connections
		let remainingStations = [... this._stationsList], stations = [];
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
						value -= bestValue / 10;
						if (station.districts[0] == bestStation.districts[0])
							value -= 0.01;
					}
					options.push({ x:x, y:y, v: value, links: links });
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
				}

				// Add the line to the connection
				let line = this._lines[link.line];
				new Component('polyline', connection.component, {
					id: connectionName + '-' + link.line,
					stroke: line.color, stroke_width: line.width
				});
				connection.width += line.width;
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
				x1 = a.x, y1 = a.y,	x2 = b.x, y2 = b.y;

			if (x1 == x2 && y1 == y2) continue;
			if (!a.visible) continue;

			// Calculate the combined width of the lines
			let width = 0;
			for (let lineName of connection.lines) 
				width += this._lines[lineName].width;
			
			let offset = -width/2, ox = y2-y1, oy = -(x2-x1);
			let l = Math.sqrt(ox * ox + oy * oy); ox /= l; oy /= l;

			for (let component of connection.component.children) {
				offset += parseFloat(component.getAttribute('stroke-width'));
				component.setAttribute('points',
					(x1 + ox * offset) + ',' + (y1 + oy * offset) + ' ' + 
					(x2 + ox * offset) + ',' + (y2 + oy * offset));
			}
		}
	}


	/** Updates the districts. */
	private updateDistricts() {
		let districtRadius = 50;
		for (let district of this._districtsList) {
			
			// Create the list of points
			let points = [];
			for (let stationName of district.stations) {
				let station = this._stations[stationName];
				if (station.gridX == undefined) continue;
				points.push({x: station.x, y: station.y});
			}

			// If there are no points, don't draw anything
			if (points.length == 0) continue;

			// If there are is one point, create another point next to it
			if (points.length == 1)
				points.push({ x: points[0].x + 0.0001, y: points[0].y });

			// Get the starting point (the one with the lowest X value)
			let pointIndex, pointCount = points.length;
			let startVertex = 0, startingX = points[0].x;
			for (pointIndex = 1; pointIndex < pointCount; pointIndex++) {
				let point = points[pointIndex];
				if (startingX <= point.x) continue;
				startVertex = pointIndex; startingX = point.x;
			}

			// Calculate the convex hull
			let vertex = startVertex, angle, newAngle = 1000, vertexIndex = 0,
				vertexCount = pointCount, vertices : number[] = [];
			for (vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {

				// Get the x and y values of the current vertex
				let ox = points[vertex].x, oy = points[vertex].y;
		
				// Check all other points to detect possible vertices
				for (pointIndex = 0; pointIndex < pointCount; pointIndex++){
					if (pointIndex == vertex || 
						vertices.includes(pointIndex)) continue;
					let dx = points[pointIndex].x - ox, 
						dy = points[pointIndex].y - oy;
					if (dx == 0 && dy == 0) continue;
					let a = Math.atan2(dy, dx);
					if (angle != undefined && a < angle) a += Math.PI * 2;
					if (newAngle > a) { newAngle = a; vertex = pointIndex; }
				}

				// Add the obtained vertex and angle values to the list
				vertices.push(vertex); angle = newAngle; newAngle = 1000;
		
				// If the vertex is the starting vertex, stop the process
				if (vertex == startVertex) break;
			}
			vertices.push(startVertex); vertices.unshift(startVertex);
			vertexCount = vertices.length;

			// Create the segments
			let lines: any[] = [], lineIndex = 0, lineCount = vertexCount-1;
			for (lineIndex = 0; lineIndex < lineCount; lineIndex++){
				let v1 = points[vertices[lineIndex]],
					v2 = points[vertices[lineIndex+1]];
				lines.push({ p1: v1, p2: v2, angle: Math.atan2(
					v2.y - v1.y, v2.x - v1.x)});
			}

			// Create the path to draw, with an offset
			let offset = 50, path = '';
			for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
				let l = lines[lineIndex],
					l2 = lines[(lineIndex + 1) % lineCount],
					dx1 = Math.sin(l.angle) * districtRadius, 
					dy1 = -Math.cos(l.angle) * districtRadius,
					dx2 = Math.sin(l2.angle) * districtRadius, 
					dy2 = -Math.cos(l2.angle) * districtRadius,
					x1 = l.p1.x + dx1, y1 = l.p1.y + dy1, 
					x2 = l.p2.x + dx1, y2 = l.p2.y + dy1,
					x3 = l.p2.x + dx2, y3 = l.p2.y + dy2;
				if (lineIndex == 0)	path += 'M ' + x1 + ' ' + y1 + ' ';
				path += 'L ' + x2 +  ' ' + y2 + ' '; // Line between points
				path += 'A ' + districtRadius + ' ' + districtRadius + 
					' 0 0 1 ' + x3 + ' ' + y3  + ' '; // Arc to next line
			}
			district.element.setAttribute('d', path + 'Z');
		}
	}

	/** Updates the legends. */
	private updateLegends() {
		let fontFamily = 'arial';
		this._linesLegendItems.clear();
		let lineIndex = 0; this._linesLegend.width.value = 200;
		this._linesLegend.height.value = 30 + 20 * (this._linesList.length);
		for (let line of this._linesList) {
			new Component('rect', this._linesLegend.component, {
				fill: line.color, 
				x: 10, y: 30 + 20 * lineIndex, width: 20, height: 10});
			new Component('text', this._linesLegend.component, {
				id: line.name + 'legend', fill: 'url(#foreground_color)',
				x: 40, y: 40 + 20 * lineIndex, font_family: fontFamily, 
				font_size: 14 }, line.title);
				lineIndex++;
		}

		this._districtsLegendItems.clear();
		let districtIndex = 0; this._districtsLegend.width.value = 200;
		this._districtsLegend.height.value = 30 + 20 * (this._districtsList.length);
		for (let district of this._districtsList) {
			new Component('rect', this._districtsLegendItems, {
				fill: district.color, 
				x:10, y: 30 + 20 * districtIndex, width: 20, height: 10});
			new Component('text', this._districtsLegendItems, {
				id: district.name + 'legend', fill: 'url(#foreground_color)',
				x: 40, y: 40 + 20 * districtIndex, font_family: fontFamily, 
				font_size: 14}, district.title);
			districtIndex++;
		}
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