import { TranslateFn } from '..';

let translate: TranslateFn;
export function registerTranslateFunction(fn: TranslateFn): void {
    translate = fn;
}

export function tryTranslate(key: string, ...args: string[]) {
    if (!translate) {
        return `${key}(${args.join(', ')})`;
    }
    return translate(key, ...args);
}
