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
    missing,
    presentDomainMatrix,
    presentIndices,
    missingIndices,
    ensureMatrix,
    solve,
} from '../Helpers';

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    naieve: boolean = false
): ICriteriumResult | null {
    let weights: number[] = [];
    let concepts = vector<number>(reference.domain.diagonal());

    if (naieve) {
        weights = <number[]>dotMultiply(concepts, missing(student)).valueOf();
    } else {
        let X = presentDomainMatrix(student, reference.domain);
        for (let i of presentIndices(student)) weights[i] = 0;
        for (let i of missingIndices(student)) {
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
    let hint: IMissingNodeHint = {
        element_type: 'missing_node',
        subject,
        messages: [`Maybe you should add ${subject.name}`],
    };

    let result: ICriteriumResult = {
        id: `missing-node-${subject.name}`,
        criterion: `missing-node`,
        success: false,
        weight: 1,
        priority: 2,
        message: hint.messages[0],
        hint: hint,
    };

    return result;
}
