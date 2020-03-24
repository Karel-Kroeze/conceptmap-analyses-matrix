import { Core as CytoGraph } from 'cytoscape';

export interface ICriteria {
    Evaluate: () => CriteriumResults
}

export type CriteriumResults = ICriteriumResult[];

export interface ICriteriumResult {
    id: string
    criterium: string
    success: boolean
    message: string
    weight: number
    priority: number
    hint?: IHint
    content?: any;
}

export interface IHint {
    element_type: string
    element_id?: string
    messages: string[]
    subject?: any
}

export interface IMissingEdgeHint extends IHint {
    element_type: "missing_edge",
    source: string,
    target: string
}

export interface INodeHint extends IHint {
    element_id: string
}

export interface IEdgeHint extends IHint {
    element_id: string
}

export function isMissingEdgeHint( hint: IHint ): hint is IMissingEdgeHint {
    return hint.element_type == "missing_edge";
}
export function isNodeHint( hint: IHint ): hint is INodeHint {
    return hint.element_type == "node";
}
export function isEdgeHint( hint: IHint ): hint is IEdgeHint {
    return hint.element_type == "edge";
}