import { NodeSuggestion } from '../../src/Criteria';
import { matrix, multiply, dotMultiply, index } from '../../src/Helpers/math';
import { Domain } from '../../src/Domain';
import { Concept } from '../../src/Concept';
import IConceptMap = ut.tools.cm2.ConceptMapJSON;

let testMatrix = matrix([
    [1, 2],
    [2, 3],
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

const domain = new Domain(
    'test',
    [new Concept('bif'), new Concept('baf'), new Concept('boom')],
    matrix([
        [0.8, 0.3, 0.2],
        [0.3, 0.7, 0.6],
        [0.2, 0.6, 0.6],
    ])
);
let cm = {
    nodes: [],
    edges: [],
};
let student = domain.createStudentMatrix(cm);
test('it suggests the correct node', () => {
    let suggestion = NodeSuggestion(domain, student, true);
    expect(suggestion.hint.element_type).toBe('missing_node');
    expect(suggestion.hint.subject.name).toBe('bif');
});

let cm2 = {
    nodes: [{ id: 1, label: 'bif' }],
    edges: [],
};
let student2 = domain.createStudentMatrix(cm2);
test('it suggest the correct node [2]', () => {
    let suggestion = NodeSuggestion(domain, student2);
    expect(suggestion.hint.element_type).toBe('missing_node');
    expect(suggestion.hint.subject.name).toBe('baf');
});
let cm3 = {
    nodes: [
        { id: 1, label: 'bif' },
        { id: 2, label: 'baf' },
    ],
    edges: [],
};
let student3 = domain.createStudentMatrix(cm3);
test('it suggest the correct node [3]', () => {
    let suggestion = NodeSuggestion(domain, student3);
    expect(suggestion.hint.element_type).toBe('missing_node');
    expect(suggestion.hint.subject.name).toBe('boom');
});
