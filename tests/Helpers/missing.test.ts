import { missing, matrix } from '../../src/Helpers';

test('it works for boolean vectors', () => {
    let input = [true, true, false];
    expect(missing(input)).toEqual([0, 0, 1]);
});

test('it works for numeric vectors', () => {
    let input = [1, 12, 0];
    expect(missing(input)).toEqual([0, 0, 1]);
});

test('it fails for non-numeric or boolean values', () => {
    expect(() => missing([null, undefined, 1, 2])).toThrow(
        'unexpected data type'
    );
});

test('it works for matrices', () => {
    let input = matrix([
        [1, 0],
        [0, 23],
    ]);
    expect(missing(input)).toEqual(
        matrix([
            [0, 1],
            [1, 0],
        ])
    );
});
