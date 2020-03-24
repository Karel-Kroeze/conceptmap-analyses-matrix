import { DomainMatrix, Concept } from '../src/DomainMatrix';

let matrix: DomainMatrix;
let bif, baf, boom;

test('creates a concept', () => {
    let bif = new Concept('bif');
    expect(bif).toBeDefined();
    expect(bif.name).toBeDefined();
});

test('gets named', () => {
    expect(bif.name).toBe('bif');
});

// test('creates a domain matrix object', () => {
//     matrix = new DomainMatrix('test', ['bif', 'baf', 'boom'], new matrix());
// });
