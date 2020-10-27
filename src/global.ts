import * as analyzer from '.';

if (window) {
    // @ts-expect-error exporting globals, does that work?
    window.analyzer = analyzer;
}
