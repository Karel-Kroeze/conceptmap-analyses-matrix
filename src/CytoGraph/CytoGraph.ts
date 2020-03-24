import IConceptMap = ut.tools.cm2.ConceptMapJSON;
import { Core as CytoGraph, default as Cytoscape, NodeCollection, NodeSingular, EdgeCollection, EdgeSingular } from 'cytoscape';
import { find } from 'lodash';

export function CytoGraphFromJSON( json: IConceptMap ): CytoGraph {

    let data = [];
    for ( const node of json.nodes ){
        data.push({
            data: { 
                id: <string>node.id, 
                label: node.label 
            }
        });
    }

    for ( const edge of json.edges ){
        data.push({
            data: { 
                id: <string>edge.id,
                source: <string>edge.from,
                target: <string>edge.to,
                label: edge.label 
            }
        });
    }    

    let graph = Cytoscape({headless: true, elements: data });
    
    assignWeights( graph );
    return graph;
}

export function findMatchingEdge( edge: EdgeSingular, graph: CytoGraph ): EdgeSingular {
    return find( getEdges( graph ), _edge => edgeEqual( _edge, edge, false, false ) );
}


export function getNodes( graph: CytoGraph | NodeCollection ): NodeSingular[] {
    let nodes: NodeSingular[] = [];
    graph.nodes("").each( node => { nodes.push( node as NodeSingular ) } );
    return nodes;
}

export function getEdges( graph: CytoGraph | EdgeCollection ): EdgeSingular[] {
    let edges: EdgeSingular[] = [];
    graph.edges("").each( edge => { edges.push( edge as EdgeSingular ) } );
    return edges;
}

export function getNodeId( label: string, graph: CytoGraph ): string {
    const node = getNode( label, graph );
    if (node) return node.id();
    return undefined;
}

export function getNode( label: string, graph: CytoGraph ): NodeSingular {
    return find( getNodes( graph ), node => node.data("label") === label );
}

export function nodeEqual( a: NodeSingular, b: NodeSingular ): boolean {
    return a.data( "label" ) === b.data( "label" );
}

export function edgeEqual( a: EdgeSingular, b: EdgeSingular, strict = true, allowReversed = false ): boolean {
    return ( !strict || a.data( "label" ) === b.data( "label" ) )
        && ( nodeEqual( a.source(), b.source() ) && nodeEqual( a.target(), b.target() ) )
        || ( allowReversed && nodeEqual( a.source(), b.target() ) && nodeEqual( a.target(), b.source() ) );
}

export function assignWeights( graph: CytoGraph ): void {
    let { closeness } = <any>graph.elements().closenessCentralityNormalized({
        weight: (node) => node.data( "weight" ) || 1,
        directed: true 
    });

    graph.nodes().each( node => {
        node.data( "weight", node.data( "weight" ) || closeness( node ) );
    });

    graph.edges().each( edge => {
        edge.data( "weight", edge.data( "weight" ) || ( edge.source().data("weight") + edge.target().data("weight") ) / 2 );
    });
}

export function getWeight( node: string | NodeSingular | EdgeSingular, graph: CytoGraph ): number {
    let weight;
    if ( typeof( node ) === "string" ){
        weight = graph.elements( `#${node}` ).data( "weight" );
    } else {
        weight = graph.elements( `#${node.data("id")}` ).data( "weight" );
    }
    return parseFloat( weight );
}