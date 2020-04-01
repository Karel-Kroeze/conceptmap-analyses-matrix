export function which(array: any[]): number[] {
    return array.reduce((ret, v, i) => (!!v ? [...ret, i] : ret), []);
}
