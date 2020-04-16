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
