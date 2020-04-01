import { ConfigOptions } from 'mathjs';

declare module 'mathjs' {
    interface ConfigOptions {
        predictable?: boolean;
    }
}
