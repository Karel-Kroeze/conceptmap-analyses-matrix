import { Matrix } from 'mathjs';
import { lusolve, size } from './math';
import { vector } from './vector';

export function solve(A: Matrix, b: number[]): number[] {
    return vector(<any>lusolve(A, b));
}
