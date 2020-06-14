/// <reference types="mathjs" />
declare module 'Helpers/math' {
    export const math: Partial<import('mathjs').MathJsStatic>;
    export const index: (...ranges: any[]) => import('mathjs').Index;
    export const dotMultiply: (
        x: import('mathjs').MathType,
        y: import('mathjs').MathType
    ) => import('mathjs').MathType;
    export const matrix: {
        (format?: 'sparse' | 'dense' | undefined): import('mathjs').Matrix;
        (
            data: number[] | number[][] | import('mathjs').Matrix,
            format?: 'sparse' | 'dense' | undefined,
            dataType?: string | undefined
        ): import('mathjs').Matrix;
    };
    export const lusolve: (
        A: number | number[] | number[][] | import('mathjs').Matrix,
        b: number[] | number[][] | import('mathjs').Matrix,
        order?: number | undefined,
        threshold?: number | undefined
    ) => number[] | number[][] | import('mathjs').Matrix;
    export const sum: {
        (
            ...args: (
                | number
                | import('mathjs').BigNumber
                | import('mathjs').Fraction
            )[]
        ): any;
        (array: number[] | number[][] | import('mathjs').Matrix): any;
    };
    export const max: {
        (...args: import('mathjs').MathType[]): any;
        (
            A: number[] | number[][] | import('mathjs').Matrix,
            dim?: number | undefined
        ): any;
    };
    export const size: (
        x:
            | string
            | number
            | boolean
            | number[]
            | import('mathjs').Complex
            | import('mathjs').Unit
            | number[][]
            | import('mathjs').Matrix
    ) => number[] | number[][] | import('mathjs').Matrix;
    export const multiply: {
        <T extends number[] | number[][] | import('mathjs').Matrix>(
            x: T,
            y: import('mathjs').MathType
        ): T;
        (
            x: import('mathjs').Unit,
            y: import('mathjs').Unit
        ): import('mathjs').Unit;
        (x: number, y: number): number;
        (
            x: import('mathjs').MathType,
            y: import('mathjs').MathType
        ): import('mathjs').MathType;
    };
    export const subset: <T extends
        | string
        | number[]
        | number[][]
        | import('mathjs').Matrix>(
        value: T,
        index: import('mathjs').Index,
        replacement?: any,
        defaultValue?: any
    ) => T;
    export const sqrt: {
        (x: number): number;
        (x: import('mathjs').BigNumber): import('mathjs').BigNumber;
        (x: import('mathjs').Complex): import('mathjs').Complex;
        (x: import('mathjs').MathArray): import('mathjs').MathArray;
        (x: import('mathjs').Matrix): import('mathjs').Matrix;
        (x: import('mathjs').Unit): import('mathjs').Unit;
    };
    export const diag: {
        (
            X: number[] | number[][] | import('mathjs').Matrix,
            format?: string | undefined
        ): import('mathjs').Matrix;
        (
            X: number[] | number[][] | import('mathjs').Matrix,
            k: number | import('mathjs').BigNumber,
            format?: string | undefined
        ): number[] | number[][] | import('mathjs').Matrix;
    };
    export const chain: (value?: any) => import('mathjs').MathJsChain;
    export const inv: <T extends
        | number
        | number[]
        | import('mathjs').Complex
        | number[][]
        | import('mathjs').Matrix>(
        x: T
    ) => T extends number
        ? number
        : T extends string
        ? string
        : T extends boolean
        ? boolean
        : T;
    export const subtract: (
        x: import('mathjs').MathType,
        y: import('mathjs').MathType
    ) => import('mathjs').MathType;
    export const equal: (
        x:
            | string
            | number
            | number[]
            | import('mathjs').BigNumber
            | import('mathjs').Fraction
            | import('mathjs').Complex
            | import('mathjs').Unit
            | number[][]
            | import('mathjs').Matrix,
        y:
            | string
            | number
            | number[]
            | import('mathjs').BigNumber
            | import('mathjs').Fraction
            | import('mathjs').Complex
            | import('mathjs').Unit
            | number[][]
            | import('mathjs').Matrix
    ) => boolean | number[] | number[][] | import('mathjs').Matrix;
}
declare module 'Concept' {
    export const MATCH_THRESHOLD = 0.8;
    export interface Match {
        name: string;
        similarity: number;
    }
    export interface IConceptJSON {
        name: string;
        synonyms: string[];
    }
    export class Concept {
        name: string;
        synonyms: string[];
        constructor(name: string, synonyms?: string[]);
        BestSuggestion(other: string, threshold?: number): Match | null;
        Suggestions(other: string, threshold?: number): Match[];
        static Similarity(a: string, b: string): number;
    }
}
declare module 'Criteria/ICriterion' {
    import { Domain } from 'Domain';
    import { Matrix } from 'mathjs';
    import { IdType } from 'vis';
    export const COOLDOWN: {
        NONE: number;
        SHORT: number;
        NORMAL: number;
        LONG: number;
    };
    export const MESSAGE: {
        OK: string;
        NO: string;
        YES: string;
        MISSING_LINK: string;
        MISSING_NODE: string;
        ADD_CONCEPTS: string;
        ADD_LINKS: string;
        MORE_CONCEPTS: string;
        MORE_LINKS: string;
        TYPO: string;
        TYPO_RENAME: string;
        TYPO_SAME: string;
    };
    export type TranslateFn = (key: string, ...args: string[]) => string;
    export interface ICriterion {
        (
            domain: Domain,
            student: Matrix,
            translate?: TranslateFn
        ): ICriteriumResult<IHint>;
    }
    export type CriteriumResults = ICriteriumResult<IHint>[];
    export interface ICriteriumResult<T extends IHint> {
        id: string;
        criterion: string;
        success: boolean;
        message: string;
        weight: number;
        priority: number;
        hints?: T[];
        content?: any;
    }
    export interface IHint {
        id: string;
        element_type: string;
        element_id?: IdType;
        subject?: any;
        message: string;
        responses: IResponse<IResponseAction>[];
    }
    export interface IResponse<T extends IResponseAction> {
        message: string;
        action: T;
    }
    export type IResponseActionType = 'dismiss' | 'synonym' | 'label';
    export interface IResponseAction {
        element_type?: string;
        element_id?: IdType;
        type: IResponseActionType;
        cooldown: number;
        positive: boolean;
        action?: () => void;
    }
    export interface IDismissResponseAction extends IResponseAction {
        type: 'dismiss';
    }
    export interface ISynonymResponseAction extends IResponseAction {
        element_type: string;
        element_id: string;
        type: 'synonym';
        synonym: string;
    }
    export interface ILabelResponseAction extends IResponseAction {
        element_type: string;
        element_id: string;
        type: 'label';
        label: string;
    }
    export function isMissingEdgeHint(hint: IHint): hint is IMissingEdgeHint;
    export interface IMissingEdgeHint extends IHint {
        element_type: 'missing_edge';
        source: IdType;
        target: IdType;
    }
    export function isMissingNodeHint(hint: IHint): hint is IMissingNodeHint;
    export interface IMissingNodeHint extends IHint {
        element_type: 'missing_node';
    }
    export function isNodeHint(hint: any): hint is INodeHint;
    export interface INodeHint extends IHint {
        element_type: 'node';
        element_id: IdType;
    }
    export function isTypoHint(hint: any): hint is ITypoHint;
    export interface ITypoHint extends INodeHint {
        correct_label: string;
    }
    export function isEdgeHint(hint: IHint): hint is IEdgeHint;
    export interface IEdgeHint extends IHint {
        element_type: 'edge';
        element_id: IdType;
    }
}
declare module 'Helpers/translate' {
    import { TranslateFn } from '..';
    export function registerTranslateFunction(fn: TranslateFn): void;
    export function tryTranslate(key: string, ...args: string[]): any;
}
declare module 'Criteria/ResponseFactory' {
    import {
        IResponse,
        IResponseAction,
        IResponseActionType,
    } from 'Criteria/ICriterion';
    export function createResponse(
        positive: boolean,
        message: string,
        cooldown: number,
        type: IResponseActionType
    ): IResponse<IResponseAction>;
    export function createOkResponse(
        positive?: boolean,
        message?: string,
        cooldown?: number
    ): IResponse<IResponseAction>;
    export function createMoreResponse(
        positive: boolean | undefined,
        message: string,
        cooldown?: number
    ): IResponse<IResponseAction>;
    export function createYesResponse(
        positive?: boolean,
        message?: string,
        cooldown?: number
    ): IResponse<IResponseAction>;
    export function createNoResponse(
        positive?: boolean,
        message?: string,
        cooldown?: number
    ): IResponse<IResponseAction>;
}
declare module 'Criteria/TypoSuggestion' {
    import { IConceptMatch, Domain } from 'Domain';
    import { ICriteriumResult, IHint } from 'Criteria/ICriterion';
    import { Node } from 'vis';
    export function createUnknownSuggestion(
        node: Node,
        domain: Domain,
        threshold?: number
    ): ICriteriumResult<IHint> | null;
    export function createTypoSuggestion(
        closest: IConceptMatch,
        partial?: Partial<ICriteriumResult<IHint>>
    ): ICriteriumResult<IHint>;
}
declare module 'Domain' {
    import { Concept, IConceptJSON, Match } from 'Concept';
    import { Matrix } from 'mathjs';
    import { IConceptMap } from 'Analyzer';
    import { ICriteriumResult, IHint } from './Criteria';
    export interface IDomainJSON {
        name: string;
        concepts: IConceptJSON[];
        domain: {
            mathjs: string;
            data: number[][];
        };
    }
    export interface IConceptMatch {
        concept: Concept;
        index: number;
        match: Match;
        input: string;
    }
    export class Domain {
        name: string;
        concepts: Concept[];
        domain: Matrix;
        private cm;
        constructor(name: string, concepts: Concept[], domain: Matrix);
        static fromJSON(json: IDomainJSON): Domain;
        getClosestConcept(
            input: string,
            threshold?: number
        ): IConceptMatch | null;
        createStudentMatrix(
            cm: IConceptMap,
            directed?: boolean
        ): {
            matrix: Matrix;
            typos: ICriteriumResult<IHint>[];
            unknown: ICriteriumResult<IHint>[];
        };
    }
}
declare module 'Criteria/NodeSuggestion' {
    import { Domain } from 'Domain';
    import { Matrix } from 'mathjs';
    import { ICriteriumResult, IMissingNodeHint } from 'Criteria/ICriterion';
    type WeightType = 'Weighted' | 'Quartiles';
    export interface INodeOptions {
        naieve?: boolean;
        weightType?: WeightType;
        weightBalance?: number;
        weightFactor?: number;
    }
    export function NodeSuggestion(
        reference: Domain,
        student: Matrix,
        options?: INodeOptions
    ): ICriteriumResult<IMissingNodeHint>[];
    export function getNodeWeights(
        reference: Domain,
        student: Matrix,
        options?: INodeOptions
    ): number[];
}
declare module 'Criteria/PhaseSuggestion' {
    import { Domain } from 'Domain';
    import { ICriteriumResult, IHint } from 'Criteria/ICriterion';
    import { Matrix } from 'mathjs';
    export function PhaseSuggestion(
        reference: Domain,
        student: Matrix
    ): ICriteriumResult<IHint>;
}
declare module 'Analyzer' {
    import { Node, Edge } from 'vis';
    import { Domain } from 'Domain';
    import {
        CriteriumResults,
        IEdgeOptions,
        INodeOptions,
        TranslateFn,
    } from './Criteria';
    export interface IConceptMap {
        nodes: Node[];
        edges: Edge[];
    }
    export interface IAnalyzerOptions {
        edges?: IEdgeOptions;
        nodes?: INodeOptions;
        translate?: TranslateFn;
    }
    export function Analyze(
        domain: Domain,
        student: IConceptMap,
        options?: IAnalyzerOptions
    ): CriteriumResults;
}
declare module 'index' {
    export * from 'Analyzer';
    export * from 'Concept';
    export * from 'Domain';
    export * from './Criteria';
    export * from './Helpers';
}
declare module 'Criteria/EdgeSuggestion' {
    import { Domain } from 'Domain';
    import { ICriteriumResult, IMissingEdgeHint } from 'Criteria/ICriterion';
    import { Matrix } from 'mathjs';
    /**
     * If possible, returns a suggestion for the next most informative edge.
     *
     * In naieve mode, returns the edge from the set of edges between nodes present in the
     * student matrix that is not itself present in the student matrix, maximizing by correlation
     * in the domain correlation matrix.
     *
     * In non-naieve mode, uses the inverse of the elements in the domain covariance matrix
     * present in the student matrix to obtain partial correlations. These partial correlations
     * are then compared to the domain correlation matrix, and the edge with the largest distance
     * between student and domain matrix is returned.
     *
     * @param reference Domain reference
     * @param student Student concept matrix
     * @param naieve Boolean naieve mode?
     */
    export function EdgeSuggestion(
        reference: Domain,
        student: Matrix,
        options?: IEdgeOptions
    ): ICriteriumResult<IMissingEdgeHint>[];
    export function getPartialsInternal(
        reference: Domain,
        student: Matrix,
        defaultGetter: (index: [number, number]) => number
    ): Matrix;
    export function getPartials(reference: Domain, student: Matrix): Matrix;
    export function getRemainders(reference: Domain, student: Matrix): any;
    export interface IEdgeOptions {
        weightType: 'Partials' | 'Remainder';
    }
    export function getEdgeWeights(
        reference: Domain,
        student: Matrix,
        options?: IEdgeOptions
    ): Matrix;
}
declare module 'Criteria/index' {
    export * from 'Criteria/ICriterion';
    export * from 'Criteria/NodeSuggestion';
    export * from 'Criteria/EdgeSuggestion';
}
declare module 'Helpers/cor2cov' {
    import { Matrix } from 'mathjs';
    export function cor2cov(correlation: Matrix, variance: number[]): Matrix;
}
declare module 'Helpers/cov2cor' {
    import { Matrix } from 'mathjs';
    export function cov2cor(covariance: Matrix): Matrix;
}
declare module 'Helpers/matrix' {
    import { Matrix } from 'mathjs';
    export function isMatrix(input: any): input is Matrix;
    export function ensureMatrix(
        input: number[] | number[][] | Matrix | number
    ): Matrix;
    /**
     * gets a vector of 0/1 values, where present concepts are set to 1.
     */
    export function presentConcepts(student: Matrix): number[];
    /**
     * export functions a vector of 0/1 values, where missing concepts are set to 1.
     */
    export function missingConcepts(student: Matrix): number[];
    export function presentConceptIndices(student: Matrix): number[];
    export function missingConceptIndices(student: Matrix): number[];
    export function presentStudentMatrix(student: Matrix): Matrix;
    export function presentDomainMatrix(
        student: Matrix,
        domain: Matrix
    ): Matrix;
    export function presentToDomainIndex(
        index: [number, number],
        student: Matrix
    ): [number, number];
    export function studentDomainMatrix(
        student: Matrix,
        domain: Matrix
    ): Matrix;
}
declare module 'Helpers/vector' {
    import { Matrix } from 'mathjs';
    export function isVector<T extends number | boolean>(
        input: any
    ): input is T[];
    export function isVector2D(input: any): input is number[][];
    export function vector<T>(input: T[]): T[];
    export function vector<T>(input: T[][]): T[];
    export function vector(input: Matrix): number[];
    export function range(start: number, end: number): number[];
    export function range(size: number): number[];
}
declare module 'Helpers/solve' {
    import { Matrix } from 'mathjs';
    export function solve(
        A: Matrix | number[][],
        b: Matrix | number[][] | number[]
    ): number[];
}
declare module 'Helpers/which' {
    import { Matrix } from 'mathjs';
    export function which<T extends number | boolean>(array: T[]): number[];
    export function which<T extends number | boolean>(
        matrix: T[][] | Matrix
    ): [number, number][];
}
declare module 'Helpers/missing' {
    import { Matrix } from 'mathjs';
    export function missing(input: boolean[] | number[]): number[];
    export function missing(input: Matrix): Matrix;
}
declare module 'Helpers/index' {
    export * from 'Helpers/math';
    export * from 'Helpers/matrix';
    export * from 'Helpers/solve';
    export * from 'Helpers/vector';
    export * from 'Helpers/which';
    export * from 'Helpers/missing';
    export * from 'Helpers/cov2cor';
    export * from 'Helpers/cor2cov';
}
