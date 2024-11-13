export { Node } from "./data/Node.js";
export { NodeSet } from "./data/NodeSet.js";
export { NodeLink } from "./data/NodeLink.js";
export { NodeType } from "./data/NodeType.js";
export { Simple } from "./data/types/Simple.js";
export { Boolean } from "./data/types/simple/Boolean.js";
export { Number } from "./data/types/simple/Number.js";
export { String } from "./data/types/simple/String.js";
export { Complex } from "./data/types/Complex.js";
export { Vector } from "./data/types/complex/Vector.js";
export { Color } from "./data/types/complex/Color.js";
export { Item } from "./data/model/Item.js";
export { Domain } from "./data/model/items/Domain.js";
export { Class } from "./data/model/items/Class.js";
export { Property } from "./data/model/items/Property.js";
export { ClassInstance } from "./data/model/items/ClassInstance.js";
export { Relation } from "./data/model/items/Relation.js";
export { RelationInstance } from "./data/model/items/RelationInstance.js";
export { Model } from "./data/model/Model.js";
export { Animation, Easing } from "./view/Animation.js";
export { Component } from "./view/Component.js";
export { Widget } from "./view/Widget.js";
export { Layer } from "../../Backup/Layer.js";
export { UserInterface } from "./view/UserInterface.js";
export { Button } from "./view/widgets/Button.js";
export { Switch } from "./view/widgets/Switch.js";
export { TransitMap } from "./view/widgets/TransitMap.js";
import { Node } from "./data/Node.js";
import { NodeType } from "./data/NodeType.js";
import { String } from "./data/types/simple/String.js";
import { UserInterface } from "./view/UserInterface.js";
import { Model } from "./data/model/Model.js";
export class KnowledgeGraph extends Node {
    get title() { return this._title; }
    get model() { return this._model; }
    get ui() { return this._ui; }
    constructor(data = {}) {
        let instanceCount = KnowledgeGraph.instances.length;
        super('KnowledgeGraph' + (instanceCount > 0 ? instanceCount : ''));
        if (instanceCount == 0)
            console.log('Initializing ' + KnowledgeGraph.name +
                ' Version: ' + KnowledgeGraph.version +
                ' (Environment: ' + KnowledgeGraph.environment + ')');
        KnowledgeGraph.instances.push(this);
        this._title = new String('title', this, data.title || this.name);
        this._model = new Model('model', this);
        this._ui = new UserInterface('ui', this);
        if (data != undefined) {
            if (typeof data != 'object')
                throw Error('Invalid data for ' + this.id);
            this.deserialize(data);
        }
        this.update();
    }
    static init(data = {}) {
        if (typeof data == 'object')
            return new KnowledgeGraph(data);
        else if (typeof data == 'string') {
            fetch(data).then((response) => response.text())
                .then((data) => {
                data = data.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
                data = data.replace(/\,\s*\n(\s*[}|\]])/gm, '\n$1');
                let jsonData = JSON.parse(data);
                new KnowledgeGraph(jsonData);
            });
        }
        else
            throw Error('Invalid data for InteroperabilityMap initialization');
    }
}
KnowledgeGraph.type = new NodeType('KnowledgeGraph', 'root', Node.type, KnowledgeGraph);
KnowledgeGraph.version = '0.7.0';
KnowledgeGraph.instances = [];
KnowledgeGraph.environment =
    ([typeof window, typeof document].includes('undefined')) ? 'node' : 'browser';
//# sourceMappingURL=KnowledgeGraph.js.map