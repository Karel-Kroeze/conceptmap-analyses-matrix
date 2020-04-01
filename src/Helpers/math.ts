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
function isVector(input: any): input is number[] {
    return Array.isArray(input) && !input.some(v => typeof v !== 'number');
}

export function ensureMatrix(
    input: number | number[] | number[][] | Matrix
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
