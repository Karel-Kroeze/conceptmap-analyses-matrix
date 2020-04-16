import { Domain } from '../Domain';
import { Matrix } from 'mathjs';
import { ICriteriumResult, IMissingNodeHint } from './ICriterion';
import {
    dotMultiply,
    index,
    sum,
    subset,
    max,
    vector,
    missingConcepts,
    presentDomainMatrix,
    presentConceptIndices,
    missingConceptIndices,
    ensureMatrix,
    solve,
    which,
} from '../Helpers';

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    naive: boolean = false
): ICriteriumResult<IMissingNodeHint>[] {
    const weights = getNodeWeights(reference, student, naive);
    const suggestions = which(weights)
        .map(index => {
            return {
                index,
                weight: weights[index],
            };
        })
        .sort((a, b) => b.weight - a.weight);

    return suggestions.map(s => {
        const subject = reference.concepts[s.index];
        return {
            id: `missing-node-${subject.name}`,
            criterion: `missing-node`,
            weight: s.weight,
            priority: 2,
            hint: {
                element_type: 'missing_node',
                subject,
                messages: [`add node ${subject.name}`],
            },
        };
    });
}

export function getNodeWeights(
    reference: Domain,
    student: Matrix,
    naive: boolean = false
): number[] {
    let weights: number[] = [];
    let concepts = vector<number>(reference.domain.diagonal());
    if (sum(student.diagonal()) == 0) naive = true;

    if (naive) {
        weights = <number[]>(
            dotMultiply(concepts, missingConcepts(student)).valueOf()
        );
    } else {
        let X = presentDomainMatrix(student, reference.domain);
        for (let i of presentConceptIndices(student)) weights[i] = 0;
        for (let i of missingConceptIndices(student)) {
            let y = ensureMatrix(
                reference.domain.subset(
                    index(presentConceptIndices(student), [i])
                )
            );
            let lu = solve(X, y);
            weights[i] = sum(
                ...(<number[]>(
                    dotMultiply(
                        subset(concepts, index(presentConceptIndices(student))),
                        lu
                    )
                ))
            );
        }
    }
    return weights;
}
