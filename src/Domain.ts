import { Concept, IConceptJSON, MATCH_THRESHOLD, Match } from './Concept';
import { matrix } from './Helpers/math';
import { Matrix } from 'mathjs';
import { IConceptMap } from './Analyzer';
import { ICriteriumResult, IHint } from './Criteria';
import {
    createTypoSuggestion,
    createUnknownSuggestion,
} from './Criteria/TypoSuggestion';
import { Node } from 'vis';

export interface IDomainJSON {
    name: string;
    concepts: IConceptJSON[];
    domain: {
        mathjs: string;
        data: number[][];
    };
}

export interface IConceptMatch {
    concept: Concept;
    index: number;
    match: Match;
    node: Node;
}

export class Domain {
    private cm: IConceptMap | undefined;

    constructor(
        public name: string,
        public concepts: Concept[],
        public domain: Matrix
    ) {}

    static fromJSON(json: IDomainJSON): Domain {
        let concepts = json.concepts.map(c => new Concept(c));
        let domain = matrix(json.domain.data, 'dense');
        return new Domain(name, concepts, domain);
    }

    getClosestConcept(
        node: Node,
        threshold: number = MATCH_THRESHOLD
    ): IConceptMatch | null {
        return this.concepts
            .map((concept, index) => {
                let match = concept.BestSuggestion(node.label!, threshold);
                if (match) {
                    return {
                        concept,
                        index,
                        match,
                        node,
                    };
                } else return null;
            })
            .reduce((a, b) => {
                if (!a) return b;
                if (!b) return a;
                return a.match.similarity > b.match.similarity ? a : b;
            });
    }

    createStudentMatrix(
        cm: IConceptMap,
        directed: boolean = false
    ): {
        matrix: Matrix;
        matches: IConceptMatch[];
        typos: ICriteriumResult<IHint>[];
        unknown: ICriteriumResult<IHint>[];
    } {
        let student = matrix('dense');
        let typos: ICriteriumResult<IHint>[] = [];
        let unknown: ICriteriumResult<IHint>[] = [];
        student.resize([this.concepts.length, this.concepts.length], 0);

        // map concepts
        let matches: IConceptMatch[] = [];
        for (const node of cm.nodes) {
            let closest = this.getClosestConcept(node);
            if (closest) {
                matches.push(closest);
                student.set([closest.index, closest.index], 1);
                if (closest.match.similarity < 1) {
                    typos.push(createTypoSuggestion(closest));
                }
            } else {
                let suggestion = createUnknownSuggestion(node, this);
                if (suggestion) {
                    unknown.push(suggestion);
                } else {
                    console.warn(`Could not match concept '${node.label}'`);
                }
            }
        }

        for (const edge of cm.edges) {
            let from = matches.find(m => m.node.id === edge.from!);
            let to = matches.find(m => m.node.id === edge.to!);
            if (from && to) {
                student.set([from.index, to.index], 1);
                if (!directed) {
                    student.set([to.index, from.index], 1);
                }
            } else {
                console.warn(
                    `Could not match edge '${edge.from} (${
                        from ? from.concept.name : '??'
                    }) -> ${edge.to} (${to ? to.concept.name : '??'})'`
                );
            }
        }

        return {
            matrix: student,
            matches,
            typos,
            unknown,
        };
    }
}
