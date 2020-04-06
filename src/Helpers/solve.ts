import { Matrix } from 'mathjs';
import { lusolve } from './math';
import { vector } from './vector';

export function solve(
    A: Matrix | number[][],
    b: Matrix | number[][] | number[]
): number[] {
    return vector(<any>lusolve(A, b));
}
