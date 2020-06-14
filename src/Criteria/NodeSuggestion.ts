import { Domain } from '../Domain';
import { Matrix } from 'mathjs';
import { ICriteriumResult, IMissingNodeHint, MESSAGE } from './ICriterion';
import {
    dotMultiply,
    index,
    sum,
    subset,
    vector,
    presentDomainMatrix,
    presentConceptIndices,
    missingConceptIndices,
    ensureMatrix,
    solve,
    which,
} from '../Helpers';
import { tryTranslate } from '../Helpers/translate';
import { createYesResponse, createNoResponse } from './ResponseFactory';

type WeightType = 'Weighted' | 'Quartiles';

function getBalanced(weight: number, balance: number) {
    var inverse = 1 - Math.max(0, Math.min(weight, 1)); // clamp weight to 0-1;
    return balance * weight + (1 - balance) * inverse; // weighted average
}

function getQuartile(value: number, values: number[]) {
    return values.filter(v => v <= value).length / values.length;
}

function postProcessWeights(
    weights: number[],
    options: INodeOptions
): number[] {
    switch (options.weightType) {
        case 'Weighted':
            return weights.map(w => getBalanced(w, options.weightBalance!));
        case 'Quartiles':
            return (
                weights
                    // calculate quartile for each value
                    .map(w => getQuartile(w, weights))
                    // convert to 1 - distance from ideal
                    .map(q => 1 - Math.abs(q - options.weightBalance!))
            );
        default:
            throw 'unexpected type';
    }
}

export interface INodeOptions {
    naieve?: boolean;
    weightType?: WeightType;
    weightBalance?: number;
    weightFactor?: number;
}

const defaultNodeOptions: INodeOptions = {
    naieve: true,
    weightType: 'Weighted',
    weightBalance: 1,
    weightFactor: 1,
};

export function NodeSuggestion(
    reference: Domain,
    student: Matrix,
    options?: INodeOptions
): ICriteriumResult<IMissingNodeHint>[] {
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
    if (sum(student.diagonal()) == 0) options.naieve = true;

    if (options.naieve) {
        weights = concepts;
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
        // post-process
        weights = postProcessWeights(weights, options);
    }

    // set already present nodes to 0
    for (let i of presentConceptIndices(student)) weights[i] = 0;

    // apply weight factor
    return weights.map(w => w * options!.weightFactor!);
}
