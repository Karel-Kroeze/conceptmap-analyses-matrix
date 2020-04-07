import { Matrix, typeOf } from 'mathjs';
import { matrix, isVector, index, which } from '.';

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
    return presentConcepts(student).map(v => 1 - v);
}

export function presentIndices(student: Matrix): number[] {
    return which(presentConcepts(student));
}

export function missingConceptIndices(student: Matrix): number[] {
    return which(missingConcepts(student));
}

export function presentConceptMatrix(student: Matrix): Matrix {
    let present = presentIndices(student);
    return ensureMatrix(student.subset(index(present, present)));
}

export function presentDomainMatrix(student: Matrix, domain: Matrix): Matrix {
    let present = presentIndices(student);
    return ensureMatrix(domain.subset(index(present, present)));
}
