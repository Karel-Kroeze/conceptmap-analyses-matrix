import { Domain, IConceptMatch } from '../Domain';
import {
    matrix,
    sum,
    presentStudentMatrix,
    missing,
    which,
    presentDomainMatrix,
    inv,
    sqrt,
    presentConceptIndices,
    normalize,
} from '../Helpers';
import { ICriterionResult, IMissingEdgeHint, MESSAGE } from './ICriterion';
import { Matrix } from 'mathjs';
import { tryTranslate } from '../Helpers/translate';
import { createNoResponse, createYesResponse } from './ResponseFactory';

/**
 * If possible, returns a suggestion for the next most informative edge.
 *
 * In naieve mode, returns the edge from the set of edges between nodes present in the
 * student matrix that is not itself present in the student matrix, maximizing by correlation
 * in the domain correlation matrix.
 *
 * In non-naieve mode, uses the inverse of the subset of the domain covariance matrix
 * relating to concepts present in the student matrix to obtain partial correlations.
 * Weights are then equal to the partial correlations.
 * NOTE: this is NOT adaptive to edges in the student map, but we can't do that without
 * getting into directional territory?
 *
 * @param reference Domain reference
 * @param student Student concept matrix
 * @param naieve Boolean naieve mode?
 */
export function EdgeSuggestion(
    reference: Domain,
    student: Matrix,
    matches: IConceptMatch[],
    options?: IEdgeOptions
): ICriterionResult<IMissingEdgeHint>[] {
    let weights = getEdgeWeights(reference, student, options);
    let suggestions = which(weights)
        .reduce((acc: [number, number][], cur: [number, number]) => {
            if (!acc.some(s => s[0] === cur[1] && s[1] === cur[0]))
                acc.push(cur);
            return acc;
        }, [])
        .map(index => {
            return {
                index,
                weight: weights.get(index),
            };
        })
        .sort((a, b) => b.weight - a.weight);

    return suggestions.map(s => {
        const from = matches.find(m => m.index === s.index[0])!;
        const to = matches.find(m => m.index === s.index[1])!;

        return {
            id:
                `edge-suggestion-` +
                `${from?.concept.name}-` +
                `${to?.concept.name}`,
            criterion: 'edge-suggestion',
            message: 'edge-suggestion message here',
            success: false,
            weight: s.weight,
            priority: 2,
            hints: [
                {
                    id:
                        `edge-suggestion-` +
                        `${from?.concept.name}-` +
                        `${to?.concept.name}-hint`,
                    element_type: 'missing_edge',
                    message: tryTranslate(
                        MESSAGE.MISSING_LINK,
                        from.node.label!,
                        to.node.label!
                    ),
                    source: from.node.id,
                    target: to.node.id,
                    subject: { from, to, s },
                    responses: [createYesResponse(), createNoResponse()],
                },
            ],
            content: {
                reference,
                student,
            },
        };
    });
}

export function getPartialsInternal(
    reference: Domain,
    student: Matrix,
    defaultGetter: (index: [number, number]) => number
): Matrix {
    let inverseDomain = inv(
        normalize(presentDomainMatrix(student, reference.domain))
    );
    let [size] = inverseDomain.size();
    let partials = matrix('dense');
    for (let x = 1; x < size; x++) {
        for (let y = 0; y < x; y++) {
            let partial =
                -inverseDomain.get([x, y]) /
                sqrt(inverseDomain.get([x, x]) * inverseDomain.get([y, y]));
            if (!isFinite(partial) || partial == 0)
                partial = defaultGetter([x, y]);

            partials.set([x, y], partial, 0);
            partials.set([y, x], partial, 0);
        }
    }
    return partials;
}

export function getPartials(reference: Domain, student: Matrix) {
    let observed = presentDomainMatrix(student, reference.domain);
    return getPartialsInternal(reference, student, index =>
        observed.get(index)
    );
}

export interface IEdgeOptions {}

const defaultOptions: IEdgeOptions = {};

export function getEdgeWeights(
    reference: Domain,
    student: Matrix,
    options?: IEdgeOptions
): Matrix {
    options = Object.assign({}, defaultOptions, options);

    // check that we have enough concepts.
    let studentConcepts = student.diagonal() as number[];
    if (sum(studentConcepts) < 2) {
        // console.warn({ message: 'not enough concepts', student });
        return matrix('dense').resize(
            [reference.concepts.length, reference.concepts.length],
            0
        );
    }

    let presentMatrix = presentStudentMatrix(student);
    if (which(missing(presentMatrix)).length == 0) {
        // console.warn({ message: 'concept map is saturated', student });
        return matrix('dense').resize(
            [reference.concepts.length, reference.concepts.length],
            0
        );
    }

    const partials = getPartials(reference, student);
    const concepts = reference.concepts;
    const presentIndices = presentConceptIndices(student);
    const weights = matrix('dense').resize(
        [concepts.length, concepts.length],
        0
    );

    for (let ix = 1; ix < presentIndices.length; ix++) {
        for (let iy = 0; iy < ix; iy++) {
            // if student doesn't have this edge yet.
            if (!student.get([presentIndices[ix], presentIndices[iy]])) {
                const weight = partials.get([ix, iy]);
                weights.set([presentIndices[ix], presentIndices[iy]], weight);
                weights.set([presentIndices[iy], presentIndices[ix]], weight);
            }
        }
    }

    return weights;
}
