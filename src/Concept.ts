import distance from 'levenshtein-edit-distance';
import { max } from './Helpers/math';

export const MATCH_THRESHOLD = 0.8;

export interface Match {
    name: string;
    similarity: number;
}

export class Concept {
    public synonyms: string[];
    constructor(public name: string, synonyms?: string[]) {
        // add name to synonyms and filter out duplicates
        this.synonyms = [...new Set(synonyms ? [name, ...synonyms] : [name])];
    }
    BestSuggestion(
        other: string,
        threshold: number = MATCH_THRESHOLD
    ): Match | null {
        return this.Suggestions(other, threshold).reduce(
            (a: Match | null, b) => {
                if (!a) return b;
                if (!b) return a;
                return a.similarity > b.similarity ? a : b;
            },
            null
        );
    }
    Suggestions(other: string, threshold: number = MATCH_THRESHOLD): Match[] {
        return this.synonyms
            .map(s => {
                return { similarity: Concept.Similarity(s, other), name: s };
            })
            .filter(m => m.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity);
    }
    static Similarity(a: string, b: string) {
        return 1 - distance(a, b, true) / max(a.length, b.length);
    }
}
