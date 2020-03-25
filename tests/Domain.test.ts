import { Domain } from '../src/Domain';
import { all, create } from 'mathjs';
import { Concept } from '../src/Concept';
const math = create(all, {});

let domain: Domain;
test('creates a domain matrix object', () => {
    domain = new Domain(
        'test',
        [new Concept('bif'), new Concept('baf'), new Concept('boom')],
        math.matrix([
            [1, 0.3, 0.2],
            [0.3, 1, 0.6],
            [0.2, 0.6, 1],
        ])
    );
    expect(domain).toBeDefined();
});
