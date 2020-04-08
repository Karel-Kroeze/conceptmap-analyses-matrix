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
    presentDomainMatrix,
    inv,
    sqrt,
    cov2cor,
    subtract,
    equal,
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
    // check that we have enough concepts.
    let concepts = student.diagonal() as number[];
    if (sum(concepts) < 2) {
        // console.warn({ message: 'not enough concepts', student });
        return null;
    }

    let presentMatrix = presentConceptMatrix(student);
    if (which(missing(presentMatrix)).length == 0) {
        // console.warn({ message: 'concept map is saturated', student });
        return null;
    }

    let weights: Matrix = matrix().resize(reference.domain.size(), 0);
    if (naive) {
        weights = ensureMatrix(
            dotMultiply(reference.domain, missingConcepts(student)) as Matrix
        );
    } else {
        weights = ensureMatrix(
            subtract(
                presentDomainMatrix(student, cov2cor(reference.domain)),
                partials(student, reference)
            ) as Matrix
        );
    }

    let maxWeight = max(weights);
    let suggestions = which(equal(weights, maxWeight) as Matrix);
    console.log({ weights, suggestions });

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

export function partials(student: Matrix, reference: Domain): Matrix {
    let inverseDomain = inv(presentDomainMatrix(student, reference.domain));
    let [sizeX, sizeY] = inverseDomain.size();
    let partials = matrix('dense');
    for (let x = 1; x < sizeX; x++) {
        for (let y = 0; y < x; y++) {
            let partial =
                -inverseDomain.get([x, y]) /
                sqrt(inverseDomain.get([x, x]) * inverseDomain.get([y, y]));
            partials.set([x, y], partial, 1);
            partials.set([y, x], partial, 1);
        }
    }
    return partials;
}
