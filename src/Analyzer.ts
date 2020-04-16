export interface IConceptMap {
    nodes: Node[];
    edges: Edge[];
}
import {
    ICriterion,
    ICriteriumResult,
    IHint,
    isNodeHint,
    isEdgeHint,
    isMissingEdgeHint,
} from './Criteria/ICriterion';
import { Network, Position, Node, Edge } from 'vis';
import { IdType } from 'vis';
import { Domain } from './Domain';
import { EdgeSuggestion, NodeSuggestion } from './Criteria';

export function Analyze(domain: Domain, student: IConceptMap) {
    const studentMatrix = domain.createStudentMatrix(student);
    return [
        ...EdgeSuggestion(domain, studentMatrix),
        ...NodeSuggestion(domain, studentMatrix),
    ].sort((a, b) => b.weight - a.weight);
}

export function GetHintPosition(hint: IHint, network: Network): Position {
    let positions: { [nodeId: string]: Position } = {};
    if (isNodeHint(hint)) {
        positions = network.getPositions([hint.element_id]);
    }
    if (isEdgeHint(hint)) {
        let nodeIds = network.getConnectedNodes(hint.element_id) as IdType[];
        positions = network.getPositions(nodeIds);
    }
    if (isMissingEdgeHint(hint)) {
        positions = network.getPositions([hint.source, hint.target]);
    }
    let position = { x: 0, y: 0 };
    let nodeCount = 0;
    for (let node in positions) {
        position.x += positions[node].x;
        position.y += positions[node].y;
        nodeCount++;
    }
    position.x /= nodeCount;
    position.y /= nodeCount;
    return network.canvasToDOM(position);
}
