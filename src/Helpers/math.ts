import { create, all, Matrix, typeOf } from 'mathjs';

export const math = create(all, { predictable: true });

export const index = math.index!;
export const dotMultiply = math.dotMultiply!;
export const matrix = math.matrix!;
export const lusolve = math.lusolve!;
export const sum = math.sum!;
export const max = math.max!;
export const size = math.size!;
export const multiply = math.multiply!;
export const subset = math.subset!;

function isMatrix(input: any): input is Matrix {
    return typeOf(input) === 'Matrix';
}

export function ensureMatrix(input: number | Matrix): Matrix {
    if (typeof input === 'number') {
        return matrix([[input]]);
    }
    if (!isMatrix(input)) {
        return matrix(input);
    }
    return input;
}
