import { Domain } from '../src/Domain';
import { matrix, sum } from '../src/Helpers/math';
import { Concept } from '../src/Concept';
import IConceptMap = ut.tools.cm2.ConceptMapJSON;

const domain = new Domain(
    'test',
    [new Concept('bif'), new Concept('baf'), new Concept('boom')],
    matrix([
        [1, 0.3, 0.2],
        [0.3, 1, 0.6],
        [0.2, 0.6, 1],
    ])
);
test('creates a domain matrix object', () => {
    expect(domain).toBeDefined();
});

test('finds closest concepts', () => {
    let closest = domain.getClosestConcept('boem', 0);
    expect(closest).toBeDefined();
    expect(closest.concept.name).toBe('boom');
});

test('fails gracefully when nothing matched', () => {
    let closest = domain.getClosestConcept('boembastisch');
    expect(closest).toBeNull();
});

let cm: IConceptMap = {
    nodes: [],
    edges: [],
};
const student = domain.createStudentMatrix(cm);
test('creates empty student matrix', () => {
    expect(student).toBeDefined();
    expect(student.size()).toEqual([3, 3]);
    expect(sum(student)).toBe(0);
});

let cm2: IConceptMap = {
    nodes: [
        { id: 1, label: 'bif' },
        { id: 2, label: 'boom' },
    ],
    edges: [{ from: 1, to: 2, label: 'bif -> boom' }],
};
const student2 = domain.createStudentMatrix(cm2, true);
test('creates correct directed student matrix', () => {
    expect(student2).toBeDefined();
    expect(student2.size()).toEqual([3, 3]);
    expect(student2.get([0, 0])).toBe(1);
    expect(student2.get([0, 2])).toBe(1);
    expect(student2.get([2, 0])).toBe(0);
});

const student3 = domain.createStudentMatrix(cm2, false);
test('creates correct undirected student matrix', () => {
    expect(student3).toBeDefined();
    expect(student3.size()).toEqual([3, 3]);
    expect(student3.get([0, 0])).toBe(1);
    expect(student3.get([0, 2])).toBe(1);
    expect(student3.get([2, 0])).toBe(1);
});
