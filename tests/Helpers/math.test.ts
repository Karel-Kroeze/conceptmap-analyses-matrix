import { Matrix, typeOf } from 'mathjs';
import { ensureMatrix, matrix } from '../../src/Helpers/math';

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
});
