import { Component, KnowledgeGraph } from "../../KnowledgeGraph.js";
import { NodeType } from "../../data/NodeType.js";
import { Widget } from "../Widget.js";
export class TransitMap extends Widget {
    constructor(name, parent, data) {
        super(name, parent, data);
        let c = this._component;
        this._districtsElement = new Component('g', c, { id: 'districts' });
        this._connectionsElement = new Component('g', c, { id: 'connections' });
        this._stationsElement = new Component('g', c, { id: 'stations' });
        this._infoElement = new Component('g', c, { id: 'info' });
        this._anchor.value = 'center';
    }
    update(forced = false) {
        if (this._updated && !forced)
            return;
        let model = this.ancestor(KnowledgeGraph).model;
        if (forced || !this._updateTime || this._updateTime <= model.updateTime) {
            this._districtsElement.clear();
            this._connectionsElement.clear();
            this._stationsElement.clear();
            this._infoElement.clear();
            this._districts = {};
            this._districtsList = [];
            this._stations = {};
            this._stationsList = [];
            this._connections = {};
            this._connectionsList = [];
            let districtIndex = 0, districtColors = ['#ef1de5', '#037e8e',
                '#00abcd', '#620d7d', '#b206f9', '#082ebf', '#C999D3', '#F2E6F4',
                '#EBB3F3', '#F8E6FB', '#B3C3D4', '#E6EBF1', '#BFFBFF', '#EAFEFF'];
            for (let d of model.domains) {
                let district = { name: d.name, title: d.title.value,
                    description: d.description.value, stations: [] };
                district.element = new Component('path', this._districtsElement, { id: district.name,
                    fill: districtColors[districtIndex++], fill_opacity: 0.6 });
                for (let c of d.classes)
                    district.stations.push(c.name);
                this._districts[district.name] = district;
                this._districtsList.push(district);
            }
            for (let c of model.classes) {
                let station = { name: c.name, title: c.title.value,
                    description: c.description.value, lines: [], districts: [],
                    connections: {}, x: 1000, y: 1000 };
                for (let lineName of c.relations.references)
                    station.lines.push(lineName);
                for (let district of c.domains.references)
                    station.districts.push(district);
                station.element = new Component('g', this._stationsElement, {
                    id: station.name
                });
                new Component('circle', station.element, {
                    r: 10, stroke: 'url(#foreground_color)', stroke_width: '2',
                    fill: 'url(#background_color)'
                });
                let text = station.title, lines = text.split('\n'), fontSize = 10, lineSeparation = 15, lineOffset = -5 - lineSeparation * lines.length;
                let labelShadow = new Component('text', station.element, {
                    font_family: "Arial", font_size: fontSize,
                    font_weight: "bold", text_anchor: "middle",
                    stroke: 'url(#background_color)', stroke_width: 2
                });
                let label = new Component('text', station.element, {
                    font_family: "Arial", font_size: fontSize,
                    font_weight: "bold", text_anchor: "middle",
                    fill: 'url(#foreground_color)'
                });
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    let tp = { x: 0, y: lineOffset }, line = lines[lineIndex];
                    new Component('tspan', labelShadow, tp, line);
                    new Component('tspan', label, tp, line);
                    lineOffset += lineSeparation;
                }
                station.infoElement = new Component('g', this._infoElement);
                let w = 200, r = 10;
                text = station.description;
                lines = text.split('\n');
                lineOffset = 15;
                new Component('rect', station.infoElement, {
                    x: -w / 2, y: 0, width: w, height: w / 2, rx: r, ry: r,
                    font_family: "Arial", font_size: fontSize,
                    font_weight: "bold", text_anchor: "middle",
                    fill: 'url(#background_color)',
                    stroke: 'url(#foreground_color)', stroke_width: 2
                });
                let description = new Component('text', station.infoElement, {
                    font_family: "Arial", font_size: fontSize,
                    font_weight: "bold", text_anchor: "middle",
                    fill: 'url(#foreground_color)'
                });
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    let tp = { x: 0, y: lineOffset }, line = lines[lineIndex];
                    new Component('tspan', description, tp, line);
                    lineOffset += lineSeparation;
                }
                if (KnowledgeGraph.environment == 'browser') {
                    let e = station.infoElement;
                    e.enabled = false;
                    e.onclick = station.element.onclick = () => {
                        e.enabled = !e.enabled;
                        if (e.enabled)
                            console.log(station);
                    };
                }
                this._stations[station.name] = station;
                this._stationsList.push(station);
            }
            this._stationsList.sort((a, b) => b.lines.length - a.lines.length);
            let lineIndex = 0, lineColors = ['#ef1de5', '#037e8e', '#00abcd',
                '#620d7d', '#b206f9', '#082ebf', '#a59dcc', '#582bb1'], lineWidths = [2, 2, 2, 2, 2, 2, 2, 2];
            this._lines = {};
            this._linesList = [];
            for (let relation of model.relations) {
                let line = { name: relation.name,
                    title: relation.title.value,
                    description: relation.description.value,
                    color: lineColors[lineIndex],
                    stations: [], connections: [],
                    width: lineWidths[lineIndex], circular: false
                };
                for (let stationName of relation.classes.references)
                    line.stations.push(stationName);
                line.stations.sort((a, b) => this._stations[b]
                    .lines.length - this._stations[a].lines.length);
                this._lines[relation.name] = line;
                this._linesList.push(line);
                lineIndex++;
            }
            this._linesList.sort((a, b) => b.stations.length - a.stations.length);
            this.createSimpleGrid();
        }
        this.updateStations();
        this.updateDistricts();
        this.updateConnections();
        return super.update(forced);
    }
    createSimpleGrid(columns = 5, separation = 200) {
        let rows = Math.round(this._stationsList.length / columns), halfWidth = (columns - 1) / 2, halfHeight = (rows - 1) / 2, x = -halfWidth, y = -halfHeight;
        for (let station of this._stationsList) {
            station.x = x * separation;
            station.y = y * separation;
            x++;
            if (x > halfWidth) {
                x = -halfWidth;
                y++;
            }
        }
    }
    createGrid(rows = 5, columns = 10, cellSize = 100) {
        let grid = [], cx = Math.floor(columns / 2), cy = Math.floor(rows / 2);
        for (let x = 0; x < columns; x++) {
            grid[x] = [];
            for (let y = 0; y < rows; y++)
                grid[x][y] = undefined;
        }
        let remainingStations = [...this._stationsList], stations = [];
        this._connections = {};
        this._connectionsList = [];
        while (remainingStations.length > 0) {
            let station = remainingStations.shift(), options = [];
            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    if (grid[x][y])
                        continue;
                    let dx = cx - x, dy = cy - y, connectionDistance = Math.abs(dx) + Math.abs(dy), value = connectionDistance;
                    let links = [];
                    for (let line of station.lines) {
                        let bestStation, bestValue = 100000;
                        for (let previousStation of stations) {
                            if (previousStation.lines.includes(line)) {
                                let cdx = previousStation.x - x, cdy = previousStation.y - y, connectionDistance = Math.abs(cdx) + Math.abs(cdy);
                                if (bestValue > connectionDistance) {
                                    bestValue = connectionDistance;
                                    bestStation = previousStation;
                                }
                            }
                        }
                        if (!bestStation)
                            continue;
                        links.push({ station: bestStation.name, line: line });
                        value -= bestValue / 10;
                        if (station.districts[0] == bestStation.districts[0])
                            value -= 0.01;
                    }
                    options.push({ x: x, y: y, v: value, links: links });
                }
            }
            options.sort((a, b) => a.v - b.v);
            let bestGridPosition = options[0];
            grid[bestGridPosition.x][bestGridPosition.y] = station;
            station.gridX = bestGridPosition.x;
            station.gridY = bestGridPosition.y;
            for (let link of bestGridPosition.links) {
                let connectionName = station.name + '-' + link.station, connection = this._connections[connectionName];
                if (!connection) {
                    connection = { a: station.name, b: link.station,
                        lines: [], width: 0, component: new Component('g', this._connectionsElement, { id: connectionName }) };
                    this._connections[connectionName] = connection;
                    this._connectionsList.push(connection);
                }
                let line = this._lines[link.line];
                new Component('polyline', connection.component, {
                    id: connectionName + '-' + link.line,
                    stroke: line.color, stroke_width: line.width
                });
                connection.width += line.width;
            }
            stations.push(station);
        }
        let stationIndex = 0, maxStation = typeof this.debug == 'number' ? this.debug : 0;
        for (let station of stations) {
            station.x = 1000;
            station.y = 1000;
            if (maxStation && ++stationIndex > maxStation) {
                station.gridX = station.gridY = undefined;
                continue;
            }
            station.x = (station.gridX - cx) * cellSize;
            station.y = (station.gridY - cy) * cellSize;
        }
    }
    updateStations() {
        for (let station of this._stationsList) {
            let transform = 'translate(' + station.x + ', ' + station.y + ')';
            station.element.setAttribute('transform', transform);
            station.infoElement.setAttribute('transform', transform);
        }
    }
    updateConnections() {
        for (let connection of this._connectionsList) {
            let a = this._stations[connection.a], b = this._stations[connection.b], x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
            if (x1 == x2 && y1 == y2)
                continue;
            if (a.gridX == undefined)
                continue;
            let width = 0;
            for (let lineName of connection.lines)
                width += this._lines[lineName].width;
            let offset = -width / 2, ox = y2 - y1, oy = -(x2 - x1);
            let l = Math.sqrt(ox * ox + oy * oy);
            ox /= l;
            oy /= l;
            for (let component of connection.component.children) {
                offset += parseFloat(component.getAttribute('stroke-width'));
                component.setAttribute('points', (x1 + ox * offset) + ',' + (y1 + oy * offset) + ' ' +
                    (x2 + ox * offset) + ',' + (y2 + oy * offset));
            }
        }
    }
    updateDistricts() {
        let districtRadius = 50;
        for (let district of this._districtsList) {
            let points = [];
            for (let stationName of district.stations) {
                let station = this._stations[stationName];
                if (station.gridX == undefined)
                    continue;
                points.push({ x: station.x, y: station.y });
            }
            if (points.length == 0)
                continue;
            if (points.length == 1)
                points.push({ x: points[0].x + 0.0001, y: points[0].y });
            let pointIndex, pointCount = points.length;
            let startVertex = 0, startingX = points[0].x;
            for (pointIndex = 1; pointIndex < pointCount; pointIndex++) {
                let point = points[pointIndex];
                if (startingX <= point.x)
                    continue;
                startVertex = pointIndex;
                startingX = point.x;
            }
            let vertex = startVertex, angle, newAngle = 1000, vertexIndex = 0, vertexCount = pointCount, vertices = [];
            for (vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
                let ox = points[vertex].x, oy = points[vertex].y;
                for (pointIndex = 0; pointIndex < pointCount; pointIndex++) {
                    if (pointIndex == vertex ||
                        vertices.includes(pointIndex))
                        continue;
                    let dx = points[pointIndex].x - ox, dy = points[pointIndex].y - oy;
                    if (dx == 0 && dy == 0)
                        continue;
                    let a = Math.atan2(dy, dx);
                    if (angle != undefined && a < angle)
                        a += Math.PI * 2;
                    if (newAngle > a) {
                        newAngle = a;
                        vertex = pointIndex;
                    }
                }
                vertices.push(vertex);
                angle = newAngle;
                newAngle = 1000;
                if (vertex == startVertex)
                    break;
            }
            vertices.push(startVertex);
            vertices.unshift(startVertex);
            vertexCount = vertices.length;
            let lines = [], lineIndex = 0, lineCount = vertexCount - 1;
            for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                let v1 = points[vertices[lineIndex]], v2 = points[vertices[lineIndex + 1]];
                lines.push({ p1: v1, p2: v2, angle: Math.atan2(v2.y - v1.y, v2.x - v1.x) });
            }
            let offset = 50, path = '';
            for (lineIndex = 0; lineIndex < lineCount; lineIndex++) {
                let l = lines[lineIndex], l2 = lines[(lineIndex + 1) % lineCount], dx1 = Math.sin(l.angle) * districtRadius, dy1 = -Math.cos(l.angle) * districtRadius, dx2 = Math.sin(l2.angle) * districtRadius, dy2 = -Math.cos(l2.angle) * districtRadius, x1 = l.p1.x + dx1, y1 = l.p1.y + dy1, x2 = l.p2.x + dx1, y2 = l.p2.y + dy1, x3 = l.p2.x + dx2, y3 = l.p2.y + dy2;
                if (lineIndex == 0)
                    path += 'M ' + x1 + ' ' + y1 + ' ';
                path += 'L ' + x2 + ' ' + y2 + ' ';
                path += 'A ' + districtRadius + ' ' + districtRadius +
                    ' 0 0 1 ' + x3 + ' ' + y3 + ' ';
            }
            district.element.setAttribute('d', path + 'Z');
        }
    }
}
TransitMap.type = new NodeType('TransitMap', 'transit_map', Widget.type, TransitMap);
//# sourceMappingURL=TransitMap.js.map