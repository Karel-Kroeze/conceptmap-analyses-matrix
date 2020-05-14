import { Domain } from '../Domain';
import {
    matrix,
    ensureMatrix,
    sum,
    presentStudentMatrix,
    missing,
    which,
    presentDomainMatrix,
    inv,
    sqrt,
    cov2cor,
    subtract,
    studentDomainMatrix,
    presentConceptIndices,
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
): ICriteriumResult<IMissingEdgeHint>[] {
    let weights = getEdgeWeights(reference, student);
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
        return {
            id: 'test',
            criterion: 'edge-suggestion',
            weight: s.weight,
            priority: 1,
            hint: {
                element_type: 'missing_edge',
                messages: [
                    `${reference.concepts[s.index[0]].name} <--> ${
                    reference.concepts[s.index[1]].name
                    }`,
                ],
                source: s.index[0],
                target: s.index[1],
                subject: { from: s.index[0], to: s.index[1] },
            },
            content: {
                reference,
                student,
            },
        };
    });
}

export function getPartials(reference: Domain, student: Matrix): Matrix {
    let inverseDomain = inv(studentDomainMatrix(student, reference.domain));
    let [sizeX, sizeY] = inverseDomain.size();
    let partials = matrix('dense');
    for (let x = 1; x < sizeX; x++) {
        for (let y = 0; y < x; y++) {
            let partial = -inverseDomain.get([x, y]) / sqrt(inverseDomain.get([x, x]) * inverseDomain.get([y, y]));
            if (partial == NaN || partial == Infinity)
                partial = 0;
            partials.set([x, y], partial, 1);
            partials.set([y, x], partial, 1);
        }
    }
    return partials;
}

export function getEdgeWeights(reference: Domain, student: Matrix): Matrix {
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

    const presentWeights = ensureMatrix(
        subtract(
            presentDomainMatrix(student, cov2cor(reference.domain)),
            getPartials(reference, student)
        ) as Matrix
    );
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
                const weight = presentWeights.get([ix, iy]);
                weights.set([presentIndices[ix], presentIndices[iy]], weight);
                weights.set([presentIndices[iy], presentIndices[ix]], weight);
            }
        }
    }

    return weights;
}
