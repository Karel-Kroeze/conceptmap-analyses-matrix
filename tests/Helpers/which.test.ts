import { which } from '../../src/Helpers/which';

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
