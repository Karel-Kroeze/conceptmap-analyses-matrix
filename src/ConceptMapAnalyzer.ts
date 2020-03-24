import IConceptMap = ut.tools.cm2.ConceptMapJSON;
import { Core as CytoGraph } from 'cytoscape';
import { CytoGraphFromJSON } from './CytoGraph/CytoGraph';
import { ICriteria, ICriteriumResult, IHint, isNodeHint, isEdgeHint, isMissingEdgeHint } from './Criteria/ICriterium';
import { Criteria } from './Criteria/Criteria';
import { Network, Position } from 'vis';
import { IdType } from 'vis';

namespace ut.tools.cm2 {
    export class ConceptMapAnalyzer {
        private _student: CytoGraph;
        private _reference: CytoGraph;
        private _criteria: ICriteria;

        constructor( student: IConceptMap, reference: IConceptMap, network?: Network ){
            this._student = CytoGraphFromJSON( student );
            this._reference = CytoGraphFromJSON( reference );
            this._criteria = new Criteria( this._student, this._reference );
        }

        Analyze(): ICriteriumResult[]{ 
            return this._criteria.Evaluate().sort( (a, b) => { 
                if ( a.priority == b.priority )
                    return b.weight - a.weight 
                return a.priority - b.priority;
            });
        }
        
        static GetHintPosition( hint: IHint, network: Network ): Position {
            let positions: {[nodeId: string]: Position};
            if ( isNodeHint( hint ) ){
                positions = network.getPositions( [hint.element_id] );
            }
            if ( isEdgeHint( hint ) ){
                let nodeIds = network.getConnectedNodes( hint.element_id ) as IdType[];
                positions = network.getPositions( nodeIds );
            }
            if ( isMissingEdgeHint( hint ) ){
                positions = network.getPositions( [hint.source, hint.target] );
            }
            let position = { x: 0, y: 0 };
            let nodeCount = 0;
            for ( let node in positions ){
                position.x += positions[node].x;
                position.y += positions[node].y;
                nodeCount++;
            }
            position.x /= nodeCount;
            position.y /= nodeCount;
            return network.canvasToDOM( position );
        }
    }
}