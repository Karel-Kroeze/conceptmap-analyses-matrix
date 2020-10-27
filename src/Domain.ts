import { Concept, IConceptJSON, MATCH_THRESHOLD, Match } from './Concept';
import { matrix, multiply, inv } from './Helpers/math';
import { Matrix } from 'mathjs';
import { IConceptMap } from './Analyzer';
import { ICriterionResult, IHint } from './Criteria';
import {
    createTypoSuggestion,
    createUnknownSuggestion,
} from './Criteria/TypoSuggestion';
import { Node } from 'vis';
import { presentConceptIndices } from './Helpers';

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
        return new Domain(json.name, concepts, domain);
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

    scoreStudentMatrix(cm: IConceptMap, directed: boolean = false): number {
        let student = this.createStudentMatrix(cm, directed).matrix;

        // multiple to get student-augmented matrix
        let omega_s = multiply(this.domain, student);

        // make sure that all concepts are present
        for (let i = 0; i < this.concepts.length; i++) {
            omega_s.set([i, i], this.domain.get([i, i]));
        }

        // get inverse matrix
        let inverse = inv(omega_s);

        // calculate partial correlations
        let present = presentConceptIndices(student);
        let Rho = matrix('dense').resize(student.size(), 0);
        let rho = (i: number, j: number) => {
            if (i == j) {
                return -inverse.get([i, j]) / Math.abs(inverse.get([i, j]));
            }
            if (!present.includes(i) || !present.includes(j)) {
                return 0;
            }
            return (
                -inverse.get([i, j]) /
                Math.sqrt(inverse.get([i, i]) * inverse.get([j, j]))
            );
        };
        for (let i = 0; i < this.concepts.length; i++) {
            for (let j = 0; j < this.concepts.length; j++) {
                Rho.set([i, j], rho(i, j));
            }
        }

        // TODO: implement LL/ChiSquare?
        return 0;
    }

    createStudentMatrix(
        cm: IConceptMap,
        directed: boolean = false,
        debug: boolean = false
    ): {
        matrix: Matrix;
        matches: IConceptMatch[];
        typos: ICriterionResult<IHint>[];
        unknown: ICriterionResult<IHint>[];
        alien: string[];
        known: string[];
    } {
        let student = matrix('dense');
        let typos: ICriterionResult<IHint>[] = [];
        let unknown: ICriterionResult<IHint>[] = [];
        let alien: string[] = [];
        let known: string[] = [];
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
                    known.push(closest.match.name);
                } else {
                    known.push(node.label!);
                }
            } else {
                let suggestion = createUnknownSuggestion(node, this);
                if (suggestion) {
                    unknown.push(suggestion);
                    if (node.label)
                        known.push(suggestion.hints![0].subject.match.name);
                } else {
                    if (node.label) alien.push(node.label);
                    if (debug)
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
                if (debug)
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
            alien,
            known,
        };
    }
}
