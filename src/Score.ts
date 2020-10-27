import { Domain } from './Domain';
import { IConceptMap } from '.';
import { det, inv, log, matrix, multiply, trace } from './Helpers';

export const concepts: {
    [word: string]: { count: number; known: boolean };
} = {};

export function Score(domain: Domain, studentMap: IConceptMap) {
    // step 1; obtain student matrix.
    const { matrix: student, alien, known } = domain.createStudentMatrix(
        studentMap
    );

    // debug; fetch alien terms.
    for (const _word of alien) {
        const word = _word.toLowerCase();
        if (!concepts[word]) concepts[word] = { count: 0, known: false };
        concepts[word].count++;
    }
    for (const _word of known) {
        const word = _word.toLowerCase();
        if (!concepts[word]) concepts[word] = { count: 0, known: true };
        concepts[word].count++;
    }

    // step 2; set diagonal to 1.
    const [size, _] = student.size();
    for (let x = 0; x < size; x++) student.set([x, x], 1);

    // step 3; multiply this design matrix with domain element wise to get omega_S^*
    const OSS = matrix('dense');
    for (let x = 0; x < size; x++)
        for (let y = 0; y < size; y++)
            OSS.set([x, y], student.get([x, y]) * domain.domain.get([x, y]), 0);

    return (
        log(det(domain.domain)) +
        trace(multiply(OSS, inv(domain.domain))) -
        log(det(OSS)) -
        size
    );

    console.log({ student: student.valueOf(), omega_student: OSS.valueOf() });
}
