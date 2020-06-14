import distance from 'levenshtein-edit-distance';
import { max } from './Helpers/math';

export const MATCH_THRESHOLD = 0.8;

export interface Match {
    name: string;
    input: string;
    similarity: number;
}

export interface IConceptJSON {
    name: string;
    synonyms: string[];
}

export class Concept {
    public synonyms: string[];
    public name: string;

    constructor(name: string);
    constructor(json: IConceptJSON);
    constructor(input: IConceptJSON | string) {
        if (typeof input === 'string') {
            this.name = input;
            this.synonyms = [input];
        } else {
            // add name to synonyms and filter out duplicates
            this.name = input.name;
            this.synonyms = [
                ...new Set(input.synonyms ? [name, ...input.synonyms] : [name]),
            ];
        }
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
            .map(synonym => {
                return {
                    similarity: Concept.Similarity(synonym, other),
                    name: synonym,
                    input: other,
                };
            })
            .filter(m => m.similarity >= threshold)
            .sort((a, b) => b.similarity - a.similarity);
    }
    static Similarity(a: string, b: string) {
        return 1 - distance(a, b, true) / max(a.length, b.length);
    }
}
