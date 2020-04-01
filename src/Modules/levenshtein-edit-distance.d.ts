declare module 'levenshtein-edit-distance' {
    export default function distance(
        a: string,
        b: string,
        insensitive: boolean
    ): number;
}
