import { Domain } from '../Domain';
import {
    dotMultiply,
    index,
    lusolve,
    sum,
    subset,
    max,
    ensureMatrix,
} from '../Helpers/math';
import { Matrix } from 'mathjs';
import { ICriteriumResult, IMissingNodeHint } from './ICriterion';
import { which } from '../Helpers/which';
import { vector } from '../Helpers/vector';

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    naieve: boolean = false
): ICriteriumResult | null {
    let present: number[] = (<number[]>student.diagonal().valueOf()).map(
        v => +!!v
    );
    let presentIndices = which(present);
    let missing = present.map(v => +!v);
    let missingIndices = which(missing);
    let weights: number[] = [];
    let concepts = vector<number>(reference.domain.diagonal());

    if (naieve) {
        weights = <number[]>dotMultiply(concepts, missing).valueOf();
    } else {
        let X = ensureMatrix(
            reference.domain.subset(index(presentIndices, presentIndices))
        );
        for (let i of presentIndices) weights[i] = 0;
        for (let i of missingIndices) {
            let y = ensureMatrix(
                reference.domain.subset(index(presentIndices, [i]))
            );
            // console.log({
            //     reference: reference.domain,
            //     student,
            //     present,
            //     presentIndices,
            //     missing,
            //     missingIndices,
            //     X,
            //     y,
            // });
            let lu = <Matrix>lusolve(X, y);
            weights[i] = sum(
                ...(<number[]>(
                    dotMultiply(
                        subset(concepts, index(presentIndices)),
                        vector(lu)
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
