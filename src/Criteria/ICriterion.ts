import { Domain } from 'domain';
import { Matrix } from 'mathjs';

export interface ICriterion {
    (domain: Domain, student: Matrix): ICriteriumResult;
}

export type CriteriumResults = ICriteriumResult[];

export interface ICriteriumResult {
    id: string;
    criterion: string;
    success: boolean;
    message: string;
    weight: number;
    priority: number;
    hint?: IHint;
    content?: any;
}

export interface IHint {
    element_type: string;
    messages: string[];
    subject: any;
}

export interface IMissingEdgeHint extends IHint {
    element_type: 'missing_edge';
    source: string;
    target: string;
}

export interface IMissingNodeHint extends IHint {
    element_type: 'missing_node';
}

export interface INodeHint extends IHint {
    element_type: 'node';
    element_id: string;
}

export interface IEdgeHint extends IHint {
    element_type: 'edge';
    element_id: string;
}

export function isMissingNodeHint(hint: IHint): hint is IMissingNodeHint {
    return hint.element_type == 'missing_node';
}

export function isMissingEdgeHint(hint: IHint): hint is IMissingEdgeHint {
    return hint.element_type == 'missing_edge';
}
export function isNodeHint(hint: IHint): hint is INodeHint {
    return hint.element_type == 'node';
}
export function isEdgeHint(hint: IHint): hint is IEdgeHint {
    return hint.element_type == 'edge';
}
