import { ICriterium, CriteriumResults } from "./ICriterium";
import { Core as CytoGraph, NodeSingular, EdgeSingular } from 'cytoscape';
import { differenceWith, some as any, flatten } from "lodash";
import { getEdges, getNodes, getNodeId, nodeEqual, edgeEqual } from "../CytoGraph/CytoGraph";

export class ContentCriterium implements ICriterium {
    constructor( private student: CytoGraph, private reference: CytoGraph ) {}

    Evaluate(): CriteriumResults {
        return [
            ... this.MissingNodes(),
            ... this.SuperfluousNodes(),
            ... this.MissingEdges(),
            ... this.SuperfluousEdges(),
            ... this.ReversedEdges(),
            ... this.MislabeledEdges(),
            ... this.ShortcutEdges()
        ];
    }

    MissingNodes(): CriteriumResults {
        return this.missingNodes().map( node => { return {
            criterium: "Missing Nodes",
            success: false,
            message: `Missing node: ${node.data("label")}`,
            weight: node.data("weight")
        }});
    }   

    SuperfluousNodes(): CriteriumResults {
        return this.superfluousNodes().map( node => { return {
            criterium: "Superfluous Nodes",
            success: false,
            message: `Extra node: ${node.data("label")}`,
            weight: node.data("weight"),
            hint: {
                element_type: "node",
                element_id: node.data("id"),
                message: `Is this node really necessary?`
            }
        }});
    }

    MissingEdges(): CriteriumResults {
        return this.shortMissingEdges().map( edge => { return {
            criterium: "Missing Edges",
            success: false,
            message: `Missing edge: ${edge.data("label")}`,
            weight: edge.data("weight")
        }})
    }

    SuperfluousEdges(): CriteriumResults {
        return this.superfluousEdges()
            .filter( edge => !this.isShortcut( edge ) )
            .map( edge => { return {
                criterium: "Superfluous Edges",
                success: false,
                message: `Superfluous edge: ${edge.data("label")}`,
                weight: edge.data("weight"),
                hint: {
                    element_type: "edge",
                    element_id: edge.data("id"),
                    message: `Is this link really necessary?`
                }
            }
        })
    }

    ReversedEdges(): CriteriumResults {
        return this.reversedEdges().map( edge => { return {
            criterium: "Reversed Edges",
            success: false,
            message: `Reversed edge: ${edge.data("label")}`,
            weight: edge.data("weight"),
            hint: {
                element_type: "edge",
                element_id: edge.data("id"),
                message: `Are you sure this link is going in the right direction?`
            }
        }})
    }
    MislabeledEdges(): CriteriumResults {
        return this.mislabeledEdges().map( edge => { return {
            criterium: "Mislabeled Edges",
            success: false,
            message: `Mislabeled edge: ${edge.data("label")}`,
            weight: edge.data("weight"),
            hint: {
                element_type: "edge",
                element_id: edge.data("id"),
                message: `Are you sure this link is labelled correctly?`
            }
        }})
    }

    ShortcutEdges(): CriteriumResults {
        return this.superfluousEdges()
            .filter( edge => this.isShortcut( edge ) )
            .map( edge => {
                return {
                    criterium: "Schortcut Edge",
                    success: false,
                    message: `Schortcut: ${edge.data("label")}`,
                    weight: edge.data("weight"),
                    hint: {
                        element_type: "edge",
                        element_id: edge.data("id"),
                        message: `Should there be another concept in between?`
                    }
                }
            })
    }

    
    private missingNodes(): NodeSingular[] {
        return differenceWith( 
            getNodes( this.reference ), 
            getNodes( this.student ), 
            this.skippedNodes(),
            ( a, b ) => nodeEqual( a, b ) 
        );
    }
    private superfluousNodes(): NodeSingular[] {
        return differenceWith( 
            getNodes( this.student ), 
            getNodes( this.reference ), 
            ( a, b ) => nodeEqual( a, b ) 
        );
    }
    private shortMissingEdges(): EdgeSingular[] {
        return differenceWith( 
            getEdges( this.reference ), 
            getEdges( this.student ), 
            this.phantomEdges(),
            this.longMissingEdges(),
            (a, b) => edgeEqual( a, b, false, true ) 
        );
    }
    private superfluousEdges(): EdgeSingular[] {
        return differenceWith( 
            getEdges( this.student ), 
            getEdges( this.reference ), 
            (a, b) => edgeEqual( a, b, false, true ) 
        );
    }
    private reversedEdges(): EdgeSingular[] {
        return differenceWith(
            getEdges( this.student ),
            getEdges( this.reference ),
            this.shortMissingEdges(),
            this.superfluousEdges(),
            (a, b) => edgeEqual( a, b, false, false )
        );
    }

    private mislabeledEdges(): EdgeSingular[] {
        return differenceWith(
            getEdges( this.student ),
            getEdges( this.reference ),
            this.shortMissingEdges(),
            this.reversedEdges(),
            this.superfluousEdges(),
            (a, b) => edgeEqual( a, b, true, false )
        );
    }

    private longMissingEdges(): EdgeSingular[] {
        let short = this.missingEdges();
        let long: EdgeSingular[] = [];
        for( const edge of short ){
            // any other missing edge starts where this edge ends, or ends where this edge begins
            if ( any( short, other => nodeEqual( edge.source(), other.target() ) )
              || any( short, other => nodeEqual( edge.target(), other.source() ) ) ) {
                long.push( edge );
            } 
        }
        return long;
    }

    private skippedNodes(): NodeSingular[] {
        var skipped = this.superfluousEdges().map( edge => this.missingLinks( edge ) );
        return flatten( skipped );
    }

    private missingEdges(): EdgeSingular[] {
        return differenceWith( 
            getEdges( this.reference ), 
            getEdges( this.student ), 
            (a, b) => edgeEqual( a, b, false, true ) 
        );
    }

    private missingLinks( edge: EdgeSingular ): NodeSingular[] {
        var missing: NodeSingular[] = [];

        // get the shortest equivalent path in the reference map
        let eles = this.reference.elements();
        let path = eles.aStar({
            root: "#" + getNodeId( edge.source().data( "label" ), this.reference ),
            goal: "#" + getNodeId( edge.target().data( "label" ), this.reference ),
            directed: true
        });

        // if a path exists, return all intermediate nodes as missing links
        if ( path.found ){
            (<any>window).x = path.path;
            path.path.nodes(undefined).each( node => {
                if ( !nodeEqual( edge.source(), <NodeSingular>node ) && !nodeEqual( edge.target(),  <NodeSingular>node ) ){
                    missing.push(  <NodeSingular>node );
                }
            })
        } 
        return missing;
    }

    private isShortcut( edge: EdgeSingular ): boolean {
        return this.missingLinks( edge ).length > 0;
    }

    private phantomEdges(): EdgeSingular[] {
        return this.missingEdges().filter( edge => this.isPhantomEdge( edge ) );
    }

    private isPhantomEdge( edge: EdgeSingular, graph: CytoGraph = this.student ): boolean {
        return !any( getNodes( graph ), node => nodeEqual( edge.target(), node ) ) 
            || !any( getNodes( graph ), node => nodeEqual( edge.source(), node ) );
    }
}
