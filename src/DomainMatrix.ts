import distance from 'levenshtein-edit-distance';
import math, { Matrix } from 'mathjs';

const MATCH_THRESHOLD = 0.8;

export class DomainMatrix {
    constructor(
        public name: string,
        public concepts: Concept[],
        public domain: Matrix
    ) {}
}

export interface Match {
    name: string;
    similarity: number;
}

export class Concept {
    constructor(public name: string, public synonyms: string[] = null) {
        // add name to synonyms and filter out duplicates
        this.synonyms = [...new Set(synonyms ? [name, ...synonyms] : [name])];
    }

    BestSuggestion(other: string, threshold: number = MATCH_THRESHOLD): Match {
        return this.Suggestions(other, threshold).reduce((a, b) =>
            a.similarity > b.similarity ? a : b
        );
    }

    Suggestions(other: string, threshold: number = MATCH_THRESHOLD): Match[] {
        return this.synonyms
            .map(s => {
                return { similarity: Concept.Similarity(s, other), name: s };
            })
            .filter(m => m.similarity >= threshold)
            .sort((a, b) => a.similarity - b.similarity);
    }

    static Similarity(a: string, b: string) {
        return 1 - distance(a, b, true) / math.max(a.length, b.length);
    }
}
