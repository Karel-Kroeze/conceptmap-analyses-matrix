import { multiply, dotMultiply, index, matrix } from '../../src/Helpers/math';

let testMatrix = matrix([
    [1, 2],
    [2, 3],
]);
let zeroMatrix = matrix([
    [0, 0],
    [0, 0],
]);
test('i understand matrix.diagonal', () => {
    expect(testMatrix.diagonal().valueOf()).toEqual([1, 3]);
});

test('multiply vector x scalar', () => {
    expect(multiply(testMatrix.diagonal(), 2).valueOf()).toEqual([2, 6]);
});

test('multiply vector x vector', () => {
    expect(dotMultiply(testMatrix.diagonal(), [3, 3]).valueOf()).toEqual([
        3,
        9,
    ]);
});

test('multiply matrix x matrix', () => {
    expect(multiply(testMatrix, zeroMatrix).valueOf()).toEqual(
        zeroMatrix.valueOf()
    );
});

let testMatrix2 = matrix([
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
    [1, 2, 3, 4],
]);
test('i understand matrix.subset', () => {
    let subset = testMatrix2.subset(index([1, 2], [1, 3]));
    expect(subset.valueOf()).toEqual([
        [2, 4],
        [2, 4],
    ]);
});

test('matrix.subset drops dimensions for scalar', () => {
    let subset2 = testMatrix2.subset(index([1], [1]));
    expect(subset2).toEqual(2);
});

test('matrix.subset does not drop dimension for vector', () => {
    let subset3 = testMatrix2.subset(index(2, [0, 1, 3]));
    expect(subset3.valueOf()).toEqual([[1, 2, 4]]);
    let subset4 = testMatrix2.subset(index([0, 1, 2], 2));
    expect(subset4.valueOf()).toEqual([[3], [3], [3]]);
});
