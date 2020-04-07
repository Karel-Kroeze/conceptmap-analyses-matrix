import { Domain } from '../Domain';
import { matrix, dotMultiply, ensureMatrix, max } from '../Helpers';
import { ICriteriumResult, IMissingEdgeHint } from './ICriterion';
import { Matrix } from 'mathjs';

/**
 * If possible, returns a suggestion for the next most informative edge.
 *
 * In naieve mode, returns the edge from the set of edges between nodes present in the
 * student matrix that is not itself present in the student matrix, maximizing by correlation
 * in the domain correlation matrix.
 *
 * In non-naieve mode, uses the inverse of the elements in the domain covariance matrix
 * present in the student matrix to obtain partial correlations. These partial correlations
 * are then compared to the domain correlation matrix, and the edge with the largest distance
 * between student and domain matrix is returned.
 *
 * @param reference Domain reference
 * @param student Student concept matrix
 * @param naieve Boolean naieve mode?
 */
export function EdgeSuggestion(
    reference: Domain,
    student: Matrix,
    naive: boolean = false
): ICriteriumResult<IMissingEdgeHint> | null {
    let weights: Matrix = matrix();

    if (naive) {
        weights = ensureMatrix(
            dotMultiply(reference.domain, student) as Matrix
        );
        console.log({ max: max(weights) });
    }

    return {
        id: 'test',
        criterion: 'edge-suggestion',
        weight: 1,
        priority: 1,
        hint: {
            element_type: 'missing_edge',
            messages: [`maybe you should add some edges?`],
            source: 'asd',
            target: 'asd',
            subject: {},
        },
    };
}
