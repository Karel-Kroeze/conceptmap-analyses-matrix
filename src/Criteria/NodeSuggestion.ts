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
    presentIndices,
    missingConceptIndices,
    ensureMatrix,
    solve,
} from '../Helpers';

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    naive: boolean = false
): ICriteriumResult<IMissingNodeHint> | null {
    let weights: number[] = [];
    let concepts = vector<number>(reference.domain.diagonal());

    if (naive) {
        weights = <number[]>(
            dotMultiply(concepts, missingConcepts(student)).valueOf()
        );
    } else {
        let X = presentDomainMatrix(student, reference.domain);
        for (let i of presentIndices(student)) weights[i] = 0;
        for (let i of missingConceptIndices(student)) {
            let y = ensureMatrix(
                reference.domain.subset(index(presentIndices(student), [i]))
            );
            let lu = solve(X, y);
            weights[i] = sum(
                ...(<number[]>(
                    dotMultiply(
                        subset(concepts, index(presentIndices(student))),
                        lu
                    )
                ))
            );
        }
    }

    let suggestedNode = weights.indexOf(max(weights));
    let subject = reference.concepts[suggestedNode];

    return {
        id: `missing-node-${subject.name}`,
        criterion: `missing-node`,
        weight: 1,
        priority: 2,
        hint: {
            element_type: 'missing_node',
            subject,
            messages: [`Maybe you should add ${subject.name}`],
        },
        content: {
            weights,
            student,
            reference,
        },
    };
}
