import IConceptMap = ut.tools.cm2.ConceptMapJSON;
import {
    ICriterion,
    ICriteriumResult,
    IHint,
    isNodeHint,
    isEdgeHint,
    isMissingEdgeHint,
} from './Criteria/ICriterion';
import { Network, IPosition } from 'vis';
import { IdType } from 'vis';
import { Domain } from './Domain';
import { Matrix } from 'mathjs';

namespace ut.tools.cm2 {
    export class Analyzer {
        private _student: Matrix;
        private _criteria: ICriterion;

        constructor(student: IConceptMap, private _reference: Domain) {
            this._student = _reference.createStudentMatrix(student);
        }

        Analyze(): ICriteriumResult[] {
            return this._criteria.Evaluate().sort((a, b) => {
                if (a.priority == b.priority) return b.weight - a.weight;
                return a.priority - b.priority;
            });
        }

        static GetHintPosition(hint: IHint, network: Network): IPosition {
            let positions: { [nodeId: string]: IPosition } = {};
            if (isNodeHint(hint)) {
                positions = network.getPositions([hint.element_id]);
            }
            if (isEdgeHint(hint)) {
                let nodeIds = network.getConnectedNodes(
                    hint.element_id
                ) as IdType[];
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
    }
}
