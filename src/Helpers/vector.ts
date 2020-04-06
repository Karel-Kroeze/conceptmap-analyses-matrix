import { Matrix } from 'mathjs';
import { flatten } from 'lodash';
import { isMatrix } from '.';

export function isVector(input: any): input is number[] {
    return Array.isArray(input) && !input.some(v => typeof v !== 'number');
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
