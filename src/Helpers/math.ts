import { create, all } from 'mathjs';

// it's still not all that fucking predictable...
export const math = create(all, { predictable: true });

export const index = math.index!;
export const dotMultiply = math.dotMultiply!;
export const matrix = math.matrix!;
export const lusolve = math.lusolve!;
export const sum = math.sum!;
export const max = math.max!;
export const size = math.size!;
export const multiply = math.multiply!;
export const subset = math.subset!;
export const sqrt = math.sqrt!;
export const diag = math.diag!;
export const chain = math.chain!;
export const inv = math.inv!;
export const subtract = math.subtract!;
export const equal = math.equal!;
