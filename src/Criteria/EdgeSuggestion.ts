import { Domain } from '../Domain';
import {
    matrix,
    dotMultiply,
    ensureMatrix,
    max,
    missingConcepts,
    sum,
    presentConceptMatrix,
    missing,
    which,
} from '../Helpers';
import { ICriteriumResult, IMissingEdgeHint } from './ICriterion';
import { Matrix } from 'mathjs';
import { SourceMap } from 'module';

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
    let weights: Matrix = matrix().resize(reference.domain.size(), 0);
    if (naive) {
        weights = ensureMatrix(
            dotMultiply(reference.domain, missingConcepts(student)) as Matrix
        );
    }

    // check that we have enough concepts.
    let concepts = student.diagonal() as number[];
    if (sum(concepts) < 2) {
        console.warn({ message: 'not enough concepts', student });
        return null;
    }

    let presentMatrix = presentConceptMatrix(student);
    // console.dir({
    //     presentMatrix: presentMatrix.valueOf(),
    //     student: student.valueOf(),
    //     missing: which(missing(presentMatrix)),
    // });
    if (which(missing(presentMatrix)).length == 0) {
        console.warn({ message: 'concept map is saturated', student });
        return null;
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
