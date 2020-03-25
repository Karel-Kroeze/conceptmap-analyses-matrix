import { Concept } from './Concept';
import { Matrix } from 'mathjs';
export class Domain {
    constructor(
        public name: string,
        public concepts: Concept[],
        public domain: Matrix
    ) {}
}
