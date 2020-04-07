import { Matrix } from 'mathjs';
import { isVector, isMatrix } from '.';

export function missing(input: boolean[] | number[]): number[];
export function missing(input: Matrix): Matrix;
export function missing<T extends (boolean | number)[] | Matrix>(
    input: T
): number[] | Matrix {
    if (isVector(input)) return input.map(v => +!v);
    if (isMatrix(input)) return input.map(v => +!v);
    throw new Error('unexpected data type');
}
