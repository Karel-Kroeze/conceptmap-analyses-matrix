import { EdgeSuggestion, getPartials } from '../../src/Criteria';
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
const domain2 = new Domain(
    'test',
    [
        new Concept('bif'),
        new Concept('baf'),
        new Concept('boom'),
        new Concept('blurb'),
        new Concept('bazinga'),
    ],
    matrix([
        [0.095110272, 0.003706559, 0.011710665, 0.006867785, 0.0199042],
        [0.003706559, 0.13439478, 0.006451068, 0.075127648, 0.0759054],
        [0.011710665, 0.006451068, 0.115416819, 0.007321632, 0.09584154],
        [0.006867785, 0.075127648, 0.007321632, 0.123118564, 0.05573944],
        [0.019904202, 0.075905396, 0.095841543, 0.05573944, 0.22082075],
    ])
);
test('it gracefully fails for concept maps with too few concepts', () => {
    let cm = {
        nodes: [],
        edges: [],
    };
    let student = domain.createStudentMatrix(cm);
    let suggestion = EdgeSuggestion(domain, student);
    expect(suggestion.length).toEqual(0);
});
test('it gracefully fails for concept maps that are saturated', () => {
    let cm = {
        nodes: [
            { label: 'bif', id: 1 },
            { label: 'baf', id: 2 },
        ],
        edges: [{ from: 1, to: 2 }],
    };
    let student = domain.createStudentMatrix(cm);
    let suggestion = EdgeSuggestion(domain, student);
    expect(suggestion.length).toEqual(0);
});

test('it calculates correct partials', () => {
    let cm = {
        nodes: [
            { label: 'bif', id: 1 },
            { label: 'baf', id: 2 },
            { label: 'boom', id: 3 },
        ],
        edges: [
            { from: 1, to: 2 },
            { from: 1, to: 3 },
        ],
    };
    let student = domain.createStudentMatrix(cm);
    let def = matrix([
        [1.0, 0.4187179, 0.3151044],
        [0.4187179, 1.0, -0.1319398],
        [0.3151044, -0.1319398, 1.0],
    ]);

    let calc = getPartials(domain, student);
    // console.dir({
    //     student: student.valueOf(),
    //     def: def.valueOf(),
    //     calc: calc.valueOf(),
    // });

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            expect(def.get([x, y])).toBeCloseTo(calc.get([x, y]), 3);
        }
    }
});

test('it recommends an edge', () => {
    let cm = {
        nodes: [
            { label: 'bif', id: 1 },
            { label: 'baf', id: 2 },
        ],
        edges: [],
    };
    let student = domain.createStudentMatrix(cm);
    let suggestion = EdgeSuggestion(domain, student);
    expect(suggestion[0]).toBeDefined();
});

test('it recommends the correct edge', () => {
    let cm = {
        nodes: [
            { label: 'bif', id: 0 },
            { label: 'baf', id: 1 },
            { label: 'bazinga', id: 4 },
            { label: 'blurb', id: 3 },
        ],
        edges: [
            { from: 0, to: 4 },
            { from: 1, to: 3 },
            { from: 4, to: 3 },
        ],
    };

    let student = domain2.createStudentMatrix(cm);
    let suggestion = EdgeSuggestion(domain2, student);
    expect(suggestion[0].hint.subject).toEqual({ from: 1, to: 4 }); //  baf -> bazinga (bazinga -> baf)
});
