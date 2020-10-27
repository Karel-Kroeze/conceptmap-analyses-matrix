import { Matrix, typeOf } from 'mathjs';
import { matrix, isVector, index, which, missing } from '.';

export function isMatrix(input: any): input is Matrix {
    return typeOf(input) === 'Matrix';
}

export function ensureMatrix(
    input: number[] | number[][] | Matrix | number
): Matrix {
    if (typeof input === 'number') {
        return matrix([[input]]);
    }
    if (isVector(input)) {
        return matrix(input.map(v => [v])); // create column matrix for 1d vectors
    }
    if (!isMatrix(input)) {
        return matrix(input);
    }
    return input;
}

export function removeIndex(input: Matrix, index: number): Matrix {
    // there's probably a clever way to do this, but I'm just going to iterate.
    const size = input.size();
    const result = matrix('dense');

    for (let _x = 0; _x < size[0]; _x++) {
        if (_x == index) continue;
        let x = _x > index ? _x - 1 : _x;
        for (let _y = 0; _y < size[1]; _y++) {
            if (_y == index) continue;
            let y = _y > index ? _y - 1 : _y;
            result.set([x, y], input.get([_x, _y]));
        }
    }
    return result;
}

/**
 * gets a vector of 0/1 values, where present concepts are set to 1.
 */
export function presentConcepts(student: Matrix): number[] {
    return (<number[]>student.diagonal().valueOf()).map(v => +!!v);
}

/**
 * export functions a vector of 0/1 values, where missing concepts are set to 1.
 */
export function missingConcepts(student: Matrix): number[] {
    return missing(presentConcepts(student));
}

export function presentConceptIndices(student: Matrix): number[] {
    return which(presentConcepts(student));
}

export function missingConceptIndices(student: Matrix): number[] {
    return which(missingConcepts(student));
}

export function presentStudentMatrix(student: Matrix): Matrix {
    let present = presentConceptIndices(student);
    return ensureMatrix(student.subset(index(present, present)));
}

export function presentDomainMatrix(student: Matrix, domain: Matrix): Matrix {
    let present = presentConceptIndices(student);
    return ensureMatrix(domain.subset(index(present, present)));
}

export function presentToDomainIndex(
    index: [number, number],
    student: Matrix
): [number, number] {
    let present = presentConceptIndices(student);
    return [present[index[0]], present[index[1]]];
}

export function studentDomainMatrix(student: Matrix, domain: Matrix): Matrix {
    let result = matrix('dense');
    let presentStudent = presentStudentMatrix(student);
    let presentDomain = presentDomainMatrix(student, domain);
    let present = which(presentStudent);
    for (let index of present) result.set(index, presentDomain.get(index), 0);
    return result;
}

/**
 * Normalize a matrix or vector, uniformly lowering each value.
 *
 * @param matrix a 1 by X vector or X by X matrix to be normalized
 * @param normalizeFn a function that returns a normalization coefficient and accepts a size as an input. Defaults to `Math.sqrt`
 */
export function normalize(
    matrix: Matrix,
    normalizeFn: (arg0: number) => number = Math.sqrt
): Matrix {
    const [rows, cols] = matrix.size();
    if (rows != cols && (rows == 1 || cols == 1))
        return normalizeVector(matrix);
    if (rows != cols) throw 'normalize expects a square matrix';
    if (rows > 1) {
        const sizeFactor = normalizeFn(rows);
        for (let i = 1; i < rows; i++) {
            for (let j = 0; j < i; j++) {
                const adjustedVariance = matrix.get([i, j]) / sizeFactor;
                matrix.set([i, j], adjustedVariance);
                matrix.set([j, i], adjustedVariance);
            }
        }
    }
    return matrix;
}

function normalizeVector(
    vector: Matrix,
    normalizeFn: (arg0: number) => number = Math.sqrt
): Matrix {
    const size = Math.max(...vector.size());
    console.log({ vector, size });
    if (size > 1) {
        const sizeFactor = normalizeFn(size);
        vector = vector.map(v => v / sizeFactor);
    }
    return vector;
}
