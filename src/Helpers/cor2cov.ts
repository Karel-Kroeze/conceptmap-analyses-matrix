import { Matrix } from 'mathjs';
import { chain, multiply } from '.';

export function cor2cov(correlation: Matrix, variance: number[]): Matrix {
    // get standard deviations; square root of the diagonal elements.
    let sd = chain(variance).sqrt().diag().done() as Matrix;
    return multiply(multiply(sd, correlation), sd);
}
