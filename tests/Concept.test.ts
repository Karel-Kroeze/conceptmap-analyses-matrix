import { Concept } from '../src/Concept';

let bif: Concept;
test('creates a concept', () => {
    bif = new Concept('bif');
    expect(bif).toBeDefined();
});

test('gets named', () => {
    expect(bif.name).toBe('bif');
});

let baf = new Concept('baf');
let boom = new Concept('boof', ['foo', 'bar']);
test('has synonyms', () => {
    expect(boom.synonyms.length).toBe(3);
});

test('removes duplicate synonyms', () => {
    expect(new Concept('x', ['x', 'a', 'b']).synonyms.length).toBe(3);
});

test('gives correct suggestion', () => {
    expect(boom.BestSuggestion('fo', 0).name).toBe('foo');
});

test('gives suggestions in correct order', () => {
    let foo = new Concept('foo', ['goo', 'dang', 'gosh']);
    expect(foo.Suggestions('foa', 0).map(s => s.name)).toEqual([
        'foo',
        'goo',
        'gosh',
        'dang',
    ]);
});

test('gives correct distance', () => {
    expect(bif.BestSuggestion('baf', 0).similarity).toBeCloseTo(2 / 3);
});
