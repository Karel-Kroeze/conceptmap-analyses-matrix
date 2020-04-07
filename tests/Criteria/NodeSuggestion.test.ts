import { NodeSuggestion } from '../../src/Criteria';
import { matrix } from '../../src/Helpers/math';
import { Domain } from '../../src/Domain';
import { Concept } from '../../src/Concept';

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
    // console.log({
    //     presentIndices: presentIndices(student),
    //     present: present(student),
    //     missingIndices: missingIndices(student),
    //     missing: missing(student),
    // });
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
    // console.log({
    //     presentIndices: presentIndices(student2),
    //     present: present(student2),
    //     missingIndices: missingIndices(student2),
    //     missing: missing(student2),
    // });
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
    // console.log({
    //     presentIndices: presentIndices(student3),
    //     present: present(student3),
    //     missingIndices: missingIndices(student3),
    //     missing: missing(student3),
    // });
    let suggestion = NodeSuggestion(domain, student3);
    expect(suggestion.hint.element_type).toBe('missing_node');
    expect(suggestion.hint.subject.name).toBe('boom');
});
