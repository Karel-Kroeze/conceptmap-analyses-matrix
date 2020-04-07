import { which, matrix } from '../../src/Helpers';

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
test('it handles 2d array inputs', () => {
    let input = [
        [0, 1, 0],
        [0, 0, 1],
    ];
    let output = which(input);
    expect(output).toEqual([
        [0, 1],
        [1, 2],
    ]);
});
test('it handles huge array inputs', () => {
    let [x, y] = [500, 500];
    let matches = [
        [14, 50],
        [430, 144],
    ];
    let input = Array(x);
    for (let _x = 0; _x < x; _x++) input[_x] = Array(y);
    for (let [_x, _y] of matches) input[_x][_y] = 1;
    let output = which(input);
    expect(output).toEqual(matches);
});
test('it handles 2d matrices', () => {
    let input = matrix([
        [0, 1, 0],
        [0, 0, 1],
    ]);
    let output = which(input);
    expect(output).toEqual([
        [0, 1],
        [1, 2],
    ]);
});
