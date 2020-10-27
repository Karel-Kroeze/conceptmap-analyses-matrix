import { Domain } from '../Domain';
import { Matrix } from 'mathjs';
import { ICriterionResult, IMissingNodeHint, MESSAGE } from './ICriterion';
import {
    index,
    sum,
    vector,
    presentDomainMatrix,
    presentConceptIndices,
    missingConceptIndices,
    ensureMatrix,
    which,
    clamp,
    det,
    cov2cor,
    inv,
    transpose,
    multiply,
    normalize,
} from '../Helpers';
import { tryTranslate } from '../Helpers/translate';
import { createYesResponse, createNoResponse } from './ResponseFactory';

export interface INodeOptions {
    naive?: boolean;
    weightFactor?: number;
}

const defaultNodeOptions: INodeOptions = {
    naive: true,
    weightFactor: 1,
};

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    options?: INodeOptions
): ICriterionResult<IMissingNodeHint>[] {
    options = Object.assign({}, defaultNodeOptions, options);
    const weights = getNodeWeights(reference, student, options);
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
            message: 'missing-node message here',
            success: false,
            weight: s.weight,
            priority: 2,
            hints: [
                {
                    id: `missing-node-hint-${subject.name}`,
                    element_type: 'missing_node',
                    subject: {
                        weight: s.weight,
                        concept: subject,
                        index: s.index,
                    },
                    message: tryTranslate(MESSAGE.MISSING_NODE, subject.name),
                    responses: [createYesResponse(), createNoResponse()],
                },
            ],
        };
    });
}

export function getNodeWeights(
    reference: Domain,
    student: Matrix,
    options?: INodeOptions
): number[] {
    options = Object.assign({}, defaultNodeOptions, options);
    let weights: number[] = [];
    let concepts = vector<number>(reference.domain.diagonal());
    if (sum(student.diagonal()) == 0) options.naive = true;

    if (options.naive) {
        weights = concepts;
    } else {
        // large matrices get an increasing amount of explained variance,
        // leading to multi-collinearity issues. To try to avoid this, we'll
        // artificially lower the amount of variance in the matrix.
        let X = normalize(
            presentDomainMatrix(student, cov2cor(reference.domain))
        );
        for (let i of missingConceptIndices(student)) {
            let y = ensureMatrix(
                cov2cor(reference.domain).subset(
                    index(presentConceptIndices(student), [i])
                )
            );
            console.log({ pre: y.valueOf() });
            y = normalize(y);
            console.log({ post: y.valueOf() });

            let inverse = inv(X);
            // let lu = solve(X, y);
            // let R22 = sum(
            //     ...(<number[]>(
            //         dotMultiply(
            //             subset(concepts, index(presentConceptIndices(student))),
            //             lu
            //         )
            //     ))
            // );

            // https://en.wikipedia.org/wiki/Multiple_correlation#Computation
            let R2 = clamp(
                multiply(multiply(transpose(y), inverse), y).get([0, 0]),
                0.1,
                0.9
            );
            console.log({
                R2,
                concept: reference.concepts[i].name,
                variance: reference.domain.get([i, i]),
                weight: options.weightFactor,
                y: y.valueOf(),
                X: X.valueOf(),
                det: det(X),
            });

            weights[i] =
                R2 * // existing information
                (1 - R2) * // new information
                reference.domain.get([i, i]) * // total information (variance)
                options.weightFactor!; // weight factor for nodes
        }
    }

    // set already present nodes to 0
    for (let i of presentConceptIndices(student)) weights[i] = 0;
    return weights;
}
