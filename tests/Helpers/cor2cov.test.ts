import { cor2cov, matrix } from '../../src/Helpers';

test('it returns the correct covariance matrix', () => {
    let cov = matrix([
        [2.3, 0.38040602, 0.19197631],
        [0.380406, 1.5, 0.09014048],
        [0.1919763, 0.09014048, 0.8],
    ]);
    let cor = matrix([
        [1.0, 0.20480371, 0.14152681],
        [0.2048037, 1.0, 0.08228663],
        [0.1415268, 0.08228663, 1.0],
    ]);
    let variance = cov.diagonal();
    let _cov = cor2cov(cor, variance);
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            expect(_cov.get([x, y])).toBeCloseTo(cov.get([x, y]), 3);
        }
    }
});
