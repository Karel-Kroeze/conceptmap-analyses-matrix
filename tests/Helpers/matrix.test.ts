import { typeOf } from 'mathjs';
import { matrix, ensureMatrix, which } from '../../src/Helpers';

let scalar = 1;
let vector = [1, 2];
let matrixArrayD1 = [[1, 2]];
let matrixArrayD2 = [[1], [2]];
let _matrix = matrix([
    [1, 2],
    [3, 4],
]);

test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(scalar))).toBe('Matrix');
    expect(ensureMatrix(scalar).size()).toEqual([1, 1]);
});
test('ensureMatrix vector', () => {
    expect(typeOf(ensureMatrix(vector))).toBe('Matrix');
    expect(ensureMatrix(vector).size()).toEqual([2, 1]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(matrixArrayD1))).toBe('Matrix');
    expect(ensureMatrix(matrixArrayD1).size()).toEqual([1, 2]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(matrixArrayD2))).toBe('Matrix');
    expect(ensureMatrix(matrixArrayD2).size()).toEqual([2, 1]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(scalar))).toBe('Matrix');
    expect(ensureMatrix(scalar).size()).toEqual([1, 1]);
});
test('it returns the correct indeces', () => {
    let input = [true, false, false, true];
    let output = which(input);
    expect(output).toEqual([0, 3]);
});
test('it handles numeric inputs', () => {
    let input = [1, 0, 0];
    let output = which(input);
    expect(output).toEqual([0]);
});
