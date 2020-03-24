import { ICriteria, CriteriumResults, ICriteriumResult } from "./ICriterium";
import { Core as CytoGraph, NodeSingular, EdgeSingular } from 'cytoscape';
import { differenceWith, some as any, flatten } from "lodash";
import { getEdges, getNodes, getNode, getNodeId, nodeEqual, edgeEqual, findMatchingEdge } from "../CytoGraph/CytoGraph";

export class Criteria implements ICriteria {
    constructor( private student: CytoGraph, private reference: CytoGraph ) {}

    Evaluate(): CriteriumResults {
        return [
            this.Score( true ),
            this.Score( false ),
            this.ConceptDensity(),
            this.LinkDensity(),
            this.MatchingStructure(),
            ... this.MissingNodes(),
            ... this.SuperfluousNodes(),
            ... this.MissingEdges(),
            ... this.SuperfluousEdges(),
            ... this.ReversedEdges(),
            ... this.MislabeledEdges(),
            ... this.ShortcutEdges()
        ].filter( e => e );
    }

    static readonly STRUCTURE_THRESHOLDS = [
        {
            min: -Infinity,
            max: 0.5,
            message: "much too simple",
            success: false
        },
        {
            min: 0.5,
            max: 0.75,
            message: "too simple",
            success: true
        },
        {
            min: .75,
            max: 1.25,
            message: "just right",
            success: true
        },
        {
            min: 1.25,
            max: 1.5,
            message: "too complex",
            success: true
        },
        {
            min: 1.5,
            max: Infinity,
            message: "much too complex",
            success: false
        }
    ];

    Score( strict: boolean = true, a: number = 0.5, b: number = 0.5 ): ICriteriumResult {
        let missing = differenceWith( 
            this.reference.edges(),
            this.student.edges(),
            (a, b) => edgeEqual(a, b, strict, !strict )
        ).length;
        let extra = differenceWith(
            this.student.edges(),
            this.reference.edges(),
            (a, b) => edgeEqual( a, b, strict, !strict )
        ).length;
        
        // anything not extra is assumed to be correct
        let correct = this.student.edges().length - extra;

        let score = ( correct ) / ( correct + a * missing + b * extra );

        console.log( { missing, extra, correct, score, strict })

        return {
            id: "score-" + ( strict ? "strict" : "loose" ),
            criterium: "Score"+ ( strict ? "Strict" : "Loose" ),
            success: true,
            message: score.toString(),
            weight: 0,
            priority: 0,
            content: score
        }        
    }

    MatchingStructure(): ICriteriumResult {
        let reference = this.distanceMatrix( this.reference );
        let student = this.distanceMatrix( this.student );
        let complexity = student.span / reference.span;
        let threshold = Criteria.STRUCTURE_THRESHOLDS
            .filter( t => t.min < complexity && t.max >= complexity )[0];

        let importantMissingEdges = this.missingEdges()
            .sort((a, b) => { return b.data( "weight") - a.data( "weight" ) })
            .slice( 0, 5 );
 
        let result: ICriteriumResult = {
            id: "linking-structure",
            criterium: "LinkingStructure",
            success: threshold.success,
            message: threshold.message,
            weight: Math.abs( complexity - 1 ) * 2,
            priority: 2,
            content: {reference, student}
        }
        if ( !threshold.success ){
            result.hint = {
                element_type: "map",
                messages: [
                    `Now add the relationships between these concepts` 
                ]
            }
            
            for (const missing of importantMissingEdges) {
                result.hint.messages.push(`Are ${missing.source().data("label")} and ${missing.target().data("label")} related?`);
            }
        }
        return result;
    }

    static readonly LINK_DENSITY_THRESHOLDS = [
        {
            min: -Infinity,
            max: 0.5,
            message: "much too simple",
            success: false
        },
        {
            min: 0.5,
            max: 0.75,
            message: "too simple",
            success: true
        },
        {
            min: .75,
            max: 1.25,
            message: "just right",
            success: true
        },
        {
            min: 1.25,
            max: 1.5,
            message: "too complex",
            success: true
        },
        {
            min: 1.5,
            max: Infinity,
            message: "much too complex",
            success: false
        }
    ];
    LinkDensity(): ICriteriumResult {        /**
        * this criterium is nice, but it triggers the 'much too complex' case when we only have a 
        * sub-concept map filled in. That's not good feedback.
        * 
        * Hacky solution; only use this criterium if the number of concepts is equal or greater than the reference.
        */
        if ( this.student.nodes().length < this.reference.nodes().length * .9 )
            return undefined;

        let reference = this.density( this.reference );
        let student = this.density( this.student );
        let relative = student / reference;
        let threshold = Criteria.LINK_DENSITY_THRESHOLDS
            .filter( t => t.min < relative && t.max >= relative )[0];
        
        let result: ICriteriumResult = {
            id: "linking-density",
            criterium: "LinkingDensity",
            success: threshold.success,
            message: threshold.message,
            weight: Math.abs( relative -1 ),
            priority: 2,
            content: {reference, student}
        }
        if ( !threshold.success ){
            result.hint = {
                element_type: "map",
                messages: [
                    `The relations in your concept map are ${threshold.message}`
                ]
            }
        }


        return result;
    }
    static readonly CONCEPT_DENSITY_THRESHOLDS = [
        {
            min: -Infinity,
            max: 0.5,
            message: "much too simple",
            success: false
        },
        {
            min: 0.5,
            max: 0.75,
            message: "too simple",
            success: true
        },
        {
            min: .75,
            max: 1.25,
            message: "just right",
            success: true
        },
        {
            min: 1.25,
            max: 1.5,
            message: "too complex",
            success: true
        },
        {
            min: 1.5,
            max: Infinity,
            message: "much too complex",
            success: false
        }
    ];

    ConceptDensity(): ICriteriumResult {
        let student = this.student.nodes().length;
        let reference = this.reference.nodes().length;
        let relative = student / reference;
        let threshold = Criteria.CONCEPT_DENSITY_THRESHOLDS
            .filter( t => t.min < relative && t.max >= relative )[0];

            
        let importantMissingNodes = this.missingNodes()
            .sort((a, b) => { return b.data( "weight") - a.data( "weight" ) })
            .slice( 0, 5 );
        
        let result: ICriteriumResult = {
            id: "concept-density",
            criterium: "ConceptDensity",
            success: threshold.success,
            message: threshold.message,
            weight: Math.abs( relative -1 ),
            priority: 1,
            content: {reference, student}
        }
        if ( !threshold.success ){
            result.hint = {
                element_type: "map",
                messages: [
                    `Start by adding the most important concepts to your concept map.`
                ]
            }

            for (const missing of importantMissingNodes) {
                result.hint.messages.push( `Have you considered adding ${missing.data("label")} to your concept map?`);
            }
        }
        return result;
    }

    MissingNodes(): CriteriumResults {
        return this.missingNodes().map( node => { return {
            id: "missing-node-" + node.id(),
            criterium: "Missing Nodes",
            success: false,
            message: `Missing node: ${node.data("label")}`,
            weight: node.data("weight"),
            priority: 3,
            hint: {
                element_type: "missing_node",
                messages: [
                    `Are you missing a concept?`,
                    `You should add ${node.data("label")} to your concept map`    
                ],
                subject: node.data( "label" )
            }
        }});
    }   

    SuperfluousNodes(): CriteriumResults {
        return this.superfluousNodes().map( node => { return {
            id: "superfluous-node-" + node.id(),
            criterium: "Superfluous Nodes",
            success: false,
            message: `Extra node: ${node.data("label")}`,
            weight: node.data("weight"),
            priority: 3,
            hint: {
                element_type: "node",
                element_id: node.data("id"),
                messages: [
                    `Is ${node.data("label")} really necessary?`,
                ],
                subject: node.data("label")
            }
        }});
    }

    MissingEdges(): CriteriumResults {
        return this.shortMissingEdges().map( edge => { return {
            id: "missing-edge-" + edge.id(),
            criterium: "Missing Edges",
            success: false,
            message: `Missing edge: ${edge.data("label")}`,
            weight: edge.data("weight"),
            priority: 3,
            hint: {
                element_type: `missing_edge`,
                messages: [
                    `Are you missing a relation between ${edge.source().data("label")}` + 
                         ` and ${edge.target().data("label")}?`,
                    `${edge.source().data("label")} ${edge.data("label")} ${edge.target().data("label")}`
                ],
                source: getNode( edge.source().data("label"), this.student ).data( "id" ),
                target: getNode( edge.target().data("label"), this.student ).data( "id" ),
                subject: edge.data("label")
            }
        }})
    }

    SuperfluousEdges(): CriteriumResults {
        return this.superfluousEdges()
            .filter( edge => !this.isShortcut( edge ) )
            .map( edge => { return {
                id: "superfluous-edge-" + edge.id(),
                criterium: "Superfluous Edges",
                success: false,
                message: `Superfluous edge: ${edge.data("label")}`,
                weight: edge.data("weight"),
                priority: 3,
                hint: {
                    element_type: "edge",
                    element_id: edge.data("id"),
                    messages: [
                        `Is this relation really necessary?`,
                    ],
                    subject: edge.data( "label" )
                }
            }
        })
    }

    ReversedEdges(): CriteriumResults {
        return this.reversedEdges().map( edge => { return {
            id: "reversed-edge-" + edge.id(),
            criterium: "Reversed Edges",
            success: false,
            message: `Reversed edge: ${edge.data("label")}`,
            weight: edge.data("weight"),
            priority: 3,
            hint: {
                element_type: "edge",
                element_id: edge.data("id"),
                messages: [
                    `Are you sure this relation is going in the right direction?`,
                ],
                subject: edge.data("label")
            }
        }})
    }
    MislabeledEdges(): CriteriumResults {
        return this.mislabeledEdges().map( edge => { return {
            id: "mislabeled-edge-" + edge.student.id(),            
            criterium: "Mislabeled Edges",
            success: false,
            message: `Mislabeled edge: ${edge.student.data("label")}`,
            weight: edge.reference.data("weight"),
            priority: 3,
            hint: {
                element_type: "edge",
                element_id: edge.student.data("id"),
                messages: [
                    `Are you sure this relation is labelled correctly?`,
                    `Should it be labelled "${edge.reference.data("label")}"?`
                ],
                subject: edge.student
            },
            content: edge
        }})
    }

    ShortcutEdges(): CriteriumResults {
        return this.superfluousEdges()
            .filter( edge => this.isShortcut( edge ) )
            .map( edge => {
                return {
                    id: "shortcut-" + edge.id(),
                    criterium: "Schortcut Edge",
                    success: false,
                    message: `Schortcut: ${edge.data("label")}`,
                    weight: edge.data("weight"),
                    priority: 3,
                    hint: {
                        element_type: "edge",
                        element_id: edge.data("id"),
                        messages: [
                            `Should there be another concept in between?`
                        ],
                        // todo; what concept is missing? [subject]
                    }
                }
            })
    }

    
    private distanceMatrix( map ): { matrix: number[][], span: number } {
        const spanningTree = map.elements().kruskal( null );
        const nodes = spanningTree.nodes();
        const n = nodes.length;

        // initialize array
        const matrix = new Array( n );
        let span = 0;
        for ( let i = 0; i < n; i++){
            matrix[i] = new Array( n );
        }

        // get distance for all pairs
        for ( let x = 0; x < n; x++){
            let bellman = spanningTree.bellmanFord({ root: nodes[x] });
            for ( let y = 0; y <= x; y++){
                if (y == x){
                    matrix[x][y] = 0;
                } else {
                    let dist = bellman.distanceTo(nodes[y])
                    matrix[x][y] = dist;
                    matrix[y][x] = dist;
                    if ( dist > span && dist !== Infinity ) span = dist;
                }
            }
        }

        return { matrix, span };
    }

    private density( map, directed = false ): number {
        const nodes = map.nodes();
        const edges = map.edges();

        if ( nodes.length == 0 || edges.length == 0 ){
            return 0;
        }

        if (!directed){
            return edges.length / ( nodes.length * ( nodes.length - 1 ) );
        } else {
            var possible = 0;
            for ( let i = nodes.length - 1; i > 1; i-- ){
                 possible += i;
            }
            return edges.length / possible;
        }
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
            // this.longMissingEdges(), TODO: Why was this ever a good idea?
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

    private mislabeledEdges(): { student: EdgeSingular, reference: EdgeSingular }[] {
        var edges = differenceWith(
            getEdges( this.student ),
            getEdges( this.reference ),
            this.shortMissingEdges(),
            this.reversedEdges(),
            this.superfluousEdges(),
            (a, b) => edgeEqual( a, b, true, false )
        );
        return edges.map( edge => {
            return { 
                student: edge,
                reference: findMatchingEdge( edge, this.reference )
            }
        })
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
        let source = getNodeId( edge.source().data( "label" ), this.reference );
        let target = getNodeId( edge.target().data( "label" ), this.reference );
        if (source && target){
            let path = eles.aStar({
                root: "#" + source,
                goal: "#" + target,
                directed: true
            });

            // if a path exists, return all intermediate nodes as missing links
            if ( path.found ){
                path.path.nodes(undefined).each( node => {
                    if ( !nodeEqual( edge.source(), <NodeSingular>node ) && !nodeEqual( edge.target(),  <NodeSingular>node ) ){
                        missing.push(  <NodeSingular>node );
                    }
                })
            } 
            return missing;
        }
        return [];
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
