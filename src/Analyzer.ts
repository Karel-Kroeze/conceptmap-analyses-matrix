import { Node, Edge } from 'vis';
import { Domain } from './Domain';
import {
    EdgeSuggestion,
    NodeSuggestion,
    CriterionResults,
    IEdgeOptions,
    INodeOptions,
    TranslateFn,
} from './Criteria';
import { PhaseSuggestion } from './Criteria/PhaseSuggestion';
import { registerTranslateFunction } from './Helpers/translate';

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
): CriterionResults {
    if (options?.translate) registerTranslateFunction(options.translate);
    console.log({ student });

    const { matrix, matches, typos, unknown } = domain.createStudentMatrix(
        student
    );
    return [
        PhaseSuggestion(domain, matrix, matches),
        ...typos,
        ...unknown,
        ...NodeSuggestion(domain, matrix, options?.nodes),
        ...EdgeSuggestion(domain, matrix, matches, options?.edges),
    ].sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.weight - a.weight;
    });
}
