import { Matrix } from 'mathjs';
import { chain, multiply } from '.';

export function cov2cor(covariance: Matrix): Matrix {
    // get standard deviations; square root of the diagonal elements.
    let invsd = chain(covariance).diag().sqrt().diag().inv().done();
    return multiply(multiply(invsd, covariance), invsd);
}
