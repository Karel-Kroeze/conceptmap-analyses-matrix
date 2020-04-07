import { EdgeSuggestion } from '../../src/Criteria';
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
test('it gracefully fails for concept maps with too few concepts', () => {
    let cm = {
        nodes: [],
        edges: [],
    };
    let student = domain.createStudentMatrix(cm);
    let suggestion = EdgeSuggestion(domain, student);
    expect(suggestion).toBeNull();
});
test('it gracefully fails for concept maps that are saturated', () => {
    let cm = {
        nodes: [{ label: 'bif' }, { label: 'baf' }],
        edges: [{ from: 'bif' }, { to: 'baf' }],
    };
    let student = domain.createStudentMatrix(cm);
    console.log({ student });
    let suggestion = EdgeSuggestion(domain, student);
    expect(suggestion).toBeNull();
});
