import { Matrix } from 'mathjs';
import { ICriterionResult, IEdgeHint } from '.';
import { Domain, IConceptMap } from '..';
import wordCount from 'word-count';
import { tryTranslate } from '../Helpers/translate';
import { COOLDOWN, INodeHint, MESSAGE } from './ICriterion';
import { createNoResponse, createOkResponse } from './ResponseFactory';

export function LongLabelSuggestion(
    cm: IConceptMap,
    domain: Domain,
    language?: string
): ICriterionResult<IEdgeHint>[] {
    // just return suggestions for all labels of >3 words
    const threshold = language?.startsWith('zh') ? 5 : 3;
    const longLabels = cm.edges.filter(
        edge => edge.label && wordCount(edge.label) > threshold
    );

    //TODO: use similarity with names in domain to try and assign a weight?
    return longLabels.map(edge => {
        return {
            id: `long-label-${edge.id}`,
            criterion: `long-label`,
            success: false,
            weight: 0,
            priority: 1.6,
            message: ``,
            hints: [
                {
                    element_type: `edge`,
                    element_id: edge.id!,
                    id: `long-label-hint-${edge.id}`,
                    message: tryTranslate(MESSAGE.LONG_LABEL),
                    responses: [
                        createOkResponse(true),
                        createNoResponse(false, undefined, COOLDOWN.LONG),
                    ],
                },
            ],
        };
    });
}

export function LongNameSuggestion(
    cm: IConceptMap,
    domain: Domain,
    language?: string
): ICriterionResult<INodeHint>[] {
    // just return suggestions for all labels of >3 words
    const threshold = language?.startsWith('zh') ? 3 : 2;
    const longLabels = cm.nodes.filter(
        node => node.label && wordCount(node.label) > threshold
    );

    //TODO: use similarity with names in domain to try and assign a weight?
    return longLabels.map(node => {
        return {
            id: `long-name-${node.id}`,
            criterion: `long-name`,
            success: false,
            weight: 0,
            priority: 1.6,
            message: ``,
            hints: [
                {
                    element_type: `node`,
                    element_id: node.id!,
                    id: `long-name-hint-${node.id}`,
                    message: tryTranslate(MESSAGE.LONG_NAME),
                    responses: [
                        createOkResponse(true),
                        createNoResponse(false, undefined, COOLDOWN.LONG),
                    ],
                },
            ],
        };
    });
}
