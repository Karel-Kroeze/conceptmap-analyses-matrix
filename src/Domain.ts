import { Concept, MATCH_THRESHOLD } from './Concept';
import { matrix } from './Helpers/math';
import { Matrix } from 'mathjs';
import { IConceptMap } from './Analyzer';

export class Domain {
    private cm: IConceptMap | undefined;

    constructor(
        public name: string,
        public concepts: Concept[],
        public domain: Matrix
    ) {}

    getClosestConcept(
        other: string,
        threshold: number = MATCH_THRESHOLD
    ): { concept: Concept; index: number } | null {
        return this.concepts
            .map((c, i) => {
                let match = c.BestSuggestion(other, threshold);
                if (match) {
                    return {
                        concept: c,
                        index: i,
                        similarity: match.similarity,
                    };
                } else return null;
            })
            .reduce((a, b) => {
                if (!a) return b;
                if (!b) return a;
                return a.similarity > b.similarity ? a : b;
            }, null);
    }

    createStudentMatrix(cm: IConceptMap, directed: boolean = false): Matrix {
        let student = matrix('dense');
        student.resize([this.concepts.length, this.concepts.length], 0);

        // map concepts
        let concepts: {
            [conceptId: string]: { concept: Concept; index: number };
        } = {};
        for (const concept of cm.nodes) {
            let match = this.getClosestConcept(concept.label!);
            if (match) {
                concepts[concept.id!] = match;
                student.set([match.index, match.index], 1);
            } else {
                console.warn(`Could not match concept '${concept.label}'`);
            }
        }

        for (const edge of cm.edges) {
            let from = concepts[edge.from!];
            let to = concepts[edge.to!];
            if (from && to) {
                student.set([from.index, to.index], 1);
                if (!directed) student.set([to.index, from.index], 1);
            } else {
                console.warn(
                    `Could not match edge '${edge.from} (${
                        from ? from.concept.name : '??'
                    }) -> ${edge.to} (${to ? to.concept.name : '??'})'`
                );
            }
        }

        return student;
    }
}
