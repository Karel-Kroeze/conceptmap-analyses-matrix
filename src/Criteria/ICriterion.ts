import { Domain } from '../Domain';
import { Matrix } from 'mathjs';
import { IdType } from 'vis';

export const COOLDOWN = {
    NONE: 0,
    SHORT: 5,
    NORMAL: 10,
    LONG: 20,
};

export const MESSAGE = {
    OK: 'feedback.ok',
    NO: 'feedback.no',
    YES: 'feedback.yes',
    MISSING_LINK: 'feedback.hints.addLinkQuestion',
    MISSING_NODE: 'feedback.hints.addConceptQuestion',
    ADD_CONCEPTS: 'feedback.hints.addConceptsSuggestion',
    ADD_LINKS: 'feedback.hints.addLinksSuggestion',
    MORE_CONCEPTS: 'feedback.hints.addConceptsInability',
    MORE_LINKS: 'feedback.hints.addLinksInability',
    TYPO: 'feedback.hints.typoQuestion',
    TYPO_RENAME: 'feedback.hints.typoConfirm',
    TYPO_SAME: 'feedback.same',
    LONG_NAME: 'feedback.hints.longConceptName',
    LONG_LABEL: 'feedback.hints.longRelationName',

    /**
     * feedback.configuration.explanation
     * feedback.hints.intro1
     * feedback.hints.intro2
     * feedback.hints.intro3
     * feedback.maybe
     * feedback.hints.missingConceptQuestion
     * feedback.hints.superfluousConceptQuestion
     * feedback.hints.superfluousLinkQuestion
     * feedback.hints.superfluousLinkInquiry
     * feedback.hints.reversedEdgeQuestion
     * feedback.hints.mislabeledEdgeInquiry
     * feedback.hints.mislabeledEdgeQuestion
     * feedback.hints.shortcutEdgeQuestion
     * feedback.hints.shortcutMissingEdgeQuestion
     */
};

export type TranslateFn = (key: string, ...args: string[]) => string;

export interface ICriterion {
    (
        domain: Domain,
        student: Matrix,
        translate?: TranslateFn
    ): ICriterionResult<IHint>;
}

export type CriterionResults = ICriterionResult<IHint>[];

export interface ICriterionResult<T extends IHint> {
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

export function isMissingEdgeHint(hint: IHint): hint is IMissingEdgeHint {
    return hint.element_type == 'missing_edge';
}
export interface IMissingEdgeHint extends IHint {
    element_type: 'missing_edge';
    source?: IdType;
    target?: IdType;
}

export function isMissingNodeHint(hint: IHint): hint is IMissingNodeHint {
    return hint.element_type == 'missing_node';
}
export interface IMissingNodeHint extends IHint {
    element_type: 'missing_node';
}

export function isNodeHint(hint: any): hint is INodeHint {
    return hint.element_type == 'node' && !hint.correct_label;
}
export interface INodeHint extends IHint {
    element_type: 'node';
    element_id: IdType;
}

export function isTypoHint(hint: any): hint is ITypoHint {
    return hint.element_type === 'node' && hint.correct_label;
}
export interface ITypoHint extends INodeHint {
    correct_label: string;
    responses: IResponse<ILabelResponseAction | ISynonymResponseAction>[];
}

export function isEdgeHint(hint: IHint): hint is IEdgeHint {
    return hint.element_type == 'edge';
}

export interface IEdgeHint extends IHint {
    element_type: 'edge';
    element_id: IdType;
}
