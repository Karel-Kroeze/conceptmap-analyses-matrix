import { Matrix } from 'mathjs';
import { isVector, isVector2D, range } from '.';
import { isMatrix } from './matrix';

export function which<T extends number | boolean>(array: T[]): number[];
export function which<T extends number | boolean>(
    matrix: T[][] | Matrix
): [number, number][];
export function which<T extends number | boolean>(
    input: T[] | T[][] | Matrix
): number[] | [number, number][] {
    if (isVector<T>(input)) {
        return input.reduce(
            (acc, val, i) => (!!val ? [...acc, i] : acc),
            [] as number[]
        );
    }

    let getter: (x: number, y: number) => number;
    let xSize = 0,
        ySize = 0;
    if (isMatrix(input)) {
        getter = (x, y) => input.get([x, y]);
        [xSize, ySize] = input.size();
    } else if (isVector2D(input)) {
        getter = (x, y) => input[x][y];
        xSize = input.length;
        ySize = input.reduce(
            (max, cur) => (max > cur.length ? max : cur.length),
            0
        );
    } else {
        throw `Unexpected input: ${input}`;
    }

    let xRange = range(xSize),
        yRange = range(ySize);
    // get x indices
    let indices = [] as [number, number][];
    for (const x of xRange)
        for (const y of yRange) if (!!getter(x, y)) indices.push([x, y]);
    return indices;
}
