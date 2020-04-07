import { Matrix } from 'mathjs';
import { flatten } from 'lodash';
import { isMatrix } from '.';

export function isVector<T extends number | boolean>(input: any): input is T[] {
    return (
        Array.isArray(input) &&
        !input.some(v => typeof v !== 'number' && typeof v !== 'boolean')
    );
}

export function isVector2D(input: any): input is number[][] {
    return Array.isArray(input) && !input.some(v => !isVector(v));
}

export function vector<T>(input: T[]): T[];
export function vector<T>(input: T[][]): T[];
export function vector(input: Matrix): number[];
export function vector<T>(input: Matrix | T[][] | T[]): T[] {
    if (isMatrix(input)) {
        if (input.size().reduce((acc, val) => (val > 1 ? ++acc : acc), 0) > 1)
            throw 'Matrix has more than one dimension';
        return flatten(<T[][]>(<any>input.toArray()));
    } else {
        // todo: check dimensions
        return flatten(input);
    }
}

export function range(start: number, end: number): number[];
export function range(size: number): number[];
export function range(a: number, b?: number): number[] {
    if (b) return Array.from({ length: b - a }, (v, k) => k + a);
    return Array.from({ length: a }, (v, k) => k);
}
