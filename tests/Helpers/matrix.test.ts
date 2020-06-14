import { typeOf } from 'mathjs';
import {
    matrix,
    ensureMatrix,
    presentConcepts,
    missingConcepts,
    presentConceptIndices,
    missingConceptIndices,
    presentStudentMatrix,
    presentDomainMatrix,
    studentDomainMatrix,
} from '../../src/Helpers';
import { Domain } from '../../src/Domain';
import { Concept } from '../../src/Concept';

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
    expect(ensureMatrix(scalar).size()).toEqual([1, 1]);
});
test('ensureMatrix vector', () => {
    expect(typeOf(ensureMatrix(vector))).toBe('Matrix');
    expect(ensureMatrix(vector).size()).toEqual([2, 1]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(matrixArrayD1))).toBe('Matrix');
    expect(ensureMatrix(matrixArrayD1).size()).toEqual([1, 2]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(matrixArrayD2))).toBe('Matrix');
    expect(ensureMatrix(matrixArrayD2).size()).toEqual([2, 1]);
});
test('ensureMatrix scalar', () => {
    expect(typeOf(ensureMatrix(scalar))).toBe('Matrix');
    expect(ensureMatrix(scalar).size()).toEqual([1, 1]);
});

test('extracts present concept vector', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const present = presentConcepts(student);
    expect(present).toEqual([1, 0, 1]);
});

test('extracts missing concept vector', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const missing = missingConcepts(student);
    expect(missing).toEqual([0, 1, 0]);
});

test('extracts present concept indices vector', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const present = presentConceptIndices(student);
    expect(present).toEqual([0, 2]);
});

test('extracts missing concept indices vector', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const missing = missingConceptIndices(student);
    expect(missing).toEqual([1]);
});

test('extracts present student matrix', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const present = presentStudentMatrix(student);
    expect(present.valueOf()).toEqual([
        [1, 0],
        [0, 1],
    ]);
});

test('extracts present domain matrix', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [{ label: 'bif' }, { label: 'boom' }],
        edges: [],
    };
    const student = domain.createStudentMatrix(cm);
    const present = presentDomainMatrix(student, domain.domain);
    expect(present.valueOf()).toEqual([
        [1, 0.2],
        [0.2, 1],
    ]);
});

test('extracts student * domain matrix', () => {
    const domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    const cm = {
        nodes: [
            { label: 'bif', id: 1 },
            { label: 'boom', id: 3 },
        ],
        edges: [],
    };
    let student = domain.createStudentMatrix(cm);
    let present = studentDomainMatrix(student, domain.domain);
    expect(present.valueOf()).toEqual([
        [1, 0],
        [0, 1],
    ]);

    cm.nodes.push({ label: 'baf', id: 2 });
    cm.edges.push({ from: 1, to: 2 });
    student = domain.createStudentMatrix(cm);
    present = studentDomainMatrix(student, domain.domain);
    expect(present.valueOf()).toEqual([
        [1, 0.3, 0],
        [0.3, 1, 0],
        [0, 0, 1],
    ]);
});
