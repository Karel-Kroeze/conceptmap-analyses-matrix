import { cov2cor, matrix } from '../../src/Helpers';

test('it returns the correct correlation matrix', () => {
    let cov = matrix([
        [0.14903688, 0.1036863, 0.02406818],
        [0.10368635, 0.2160934, 0.0639302],
        [0.02406818, 0.0639302, 0.16494669],
    ]);
    let cor = matrix([
        [1.0, 0.5777686, 0.1535057],
        [0.5777686, 1.0, 0.3386207],
        [0.1535057, 0.3386207, 1.0],
    ]);
    let _cor = cov2cor(cov);
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            expect(_cor.get([x, y])).toBeCloseTo(cor.get([x, y]), 3);
        }
    }
});
