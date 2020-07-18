import { IConceptMatch, Domain } from '../Domain';
import {
    ICriterionResult,
    MESSAGE,
    COOLDOWN,
    IHint,
    ITypoHint,
} from './ICriterion';
import { tryTranslate } from '../Helpers/translate';
import { createResponse, createNoResponse } from './ResponseFactory';
import { Node } from 'vis';

export function createUnknownSuggestion(
    node: Node,
    domain: Domain,
    threshold = 0.5
): ICriterionResult<IHint> | null {
    let closest = domain.getClosestConcept(node, threshold); // use a significantly lower threshold to find the best match
    if (closest)
        return createTypoSuggestion(closest, { priority: 1.5, weight: 1 });
    return null;
}

export function createTypoSuggestion(
    closest: IConceptMatch,
    partial?: Partial<ICriterionResult<IHint>>
): ICriterionResult<IHint | ITypoHint> {
    return Object.assign(
        {
            criterion: `typos`,
            id: `typos-${closest.node.label}-${closest.match.name}-${closest.concept.name}`,
            success: false,
            message: `typo-message`,
            weight: 1,
            priority: 1,
            hints: [
                {
                    id: `typos-${closest.node.label}-${closest.match.name}-${closest.concept.name}-hint`,
                    correct_label: closest.match.name,
                    element_type: 'node',
                    element_id: closest.node.id,
                    message: tryTranslate(
                        MESSAGE.TYPO,
                        closest.match.name,
                        closest.node.label!
                    ),
                    subject: closest,
                    responses: [
                        createResponse(MESSAGE.TYPO_RENAME, {
                            positive: true,
                            cooldown: COOLDOWN.SHORT,
                            element_type: 'node',
                            element_id: closest.node.id,
                            type: 'label',
                            label: closest.match.name,
                        }),
                        createResponse(MESSAGE.TYPO_SAME, {
                            positive: true,
                            cooldown: COOLDOWN.SHORT,
                            element_type: 'node',
                            element_id: closest.node.id,
                            type: 'synonym',
                            synonym: closest.node.label,
                            action: () =>
                                closest.concept.synonyms.push(
                                    closest.node.label!
                                ),
                        }),
                        createNoResponse(),
                    ],
                },
            ],
        },
        partial
    );
}
