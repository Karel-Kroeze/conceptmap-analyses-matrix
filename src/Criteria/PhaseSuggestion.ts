import { Domain, IConceptMatch } from '../Domain';
import {
    ICriterionResult,
    IHint,
    MESSAGE,
    INodeHint,
    IEdgeHint,
} from './ICriterion';
import { Matrix } from 'mathjs';
import { getNodeWeights } from './NodeSuggestion';
import {
    presentConcepts,
    sum,
    presentStudentMatrix,
    presentDomainMatrix,
    which,
    presentToDomainIndex,
} from '../Helpers';
import {
    createOkResponse,
    createMoreResponse,
    createNoResponse,
    createYesResponse,
} from './ResponseFactory';
import { tryTranslate } from '../Helpers/translate';
import { Concept } from '../Concept';
import { format } from 'url';

export function PhaseSuggestion(
    reference: Domain,
    student: Matrix,
    matches: IConceptMatch[]
): ICriterionResult<IHint> {
    // for the first five concepts, suggest most important overall
    let conceptCount = sum(presentConcepts(student));
    if (conceptCount < 5) {
        return conceptPhaseCriterium(reference, student, 5 - conceptCount);
    }

    let edgeCount = sum(student) - conceptCount;

    if (edgeCount < 5) {
        return edgePhaseCriterium(reference, student, matches, 5 - edgeCount);
    }

    return {
        id: `phase-criterium-passed`,
        message: `phase-criterium-passed`,
        criterion: `phase-criterium`,
        success: true,
        weight: 1,
        priority: 1,
    };
}

function edgePhaseCriterium(
    reference: Domain,
    student: Matrix,
    matches: IConceptMatch[],
    count: number
): ICriterionResult<IHint | IEdgeHint> {
    let weights = presentDomainMatrix(student, reference.domain);
    for (let index of which(presentStudentMatrix(student)))
        weights.set(index, 0);

    let edges: {
        weight: number;
        index: [number, number];
        from: IConceptMatch;
        to: IConceptMatch;
    }[] = [];
    weights.forEach((weight, _index: any) => {
        let index = presentToDomainIndex(_index, student);
        edges.push({
            weight,
            index,
            from: matches.find(m => m.index === index[0])!,
            to: matches.find(m => m.index === index[1])!,
        });
    });
    edges = edges.sort((a, b) => b.weight - a.weight).slice(0, count);

    return {
        id: `phases-edges`,
        criterion: `phases`,
        success: false,
        message: '',
        priority: 1,
        weight: 2,
        hints: [
            {
                id: `phases-edges-intro`,
                message: tryTranslate(MESSAGE.ADD_LINKS),
                element_type: 'none',
                responses: [
                    createOkResponse(),
                    createMoreResponse(false, MESSAGE.MORE_LINKS),
                    createNoResponse(),
                ],
            },
            ...edges.map(edge => {
                return {
                    id: `phases-edges-${edge.from.concept.name}-${edge.to.concept.name}}`,
                    message: tryTranslate(
                        MESSAGE.MISSING_LINK,
                        edge.from.match.name,
                        edge.to.match.name
                    ),
                    source: edge.from.node.id,
                    target: edge.to.node.id,
                    subject: edge,
                    element_type: 'missing_edge',
                    element_id: '',
                    responses: [createYesResponse(), createNoResponse()],
                };
            }),
        ],
    };
}

function conceptPhaseCriterium(
    reference: Domain,
    student: Matrix,
    count: number
): ICriterionResult<IHint | INodeHint> {
    let weights = getNodeWeights(reference, student, { naieve: true });
    let concepts = weights
        .map((weight, index) => {
            return { weight, concept: reference.concepts[index], index };
        })
        .sort((a, b) => b.weight - a.weight)
        .slice(0, count);

    return {
        id: `phases-concepts`,
        criterion: `phases`,
        success: false,
        message: '',
        priority: 1,
        weight: 2,
        hints: [
            {
                id: `phases-concepts-intro`,
                message: tryTranslate(MESSAGE.ADD_CONCEPTS),
                element_type: 'none',
                responses: [
                    createOkResponse(),
                    createMoreResponse(false, MESSAGE.MORE_CONCEPTS),
                    createNoResponse(),
                ],
            },
            ...concepts.map(concept => {
                return {
                    id: `phases-concepts-${concept.concept.name}`,
                    element_type: `missing_node`,
                    subject: concept,
                    message: tryTranslate(
                        MESSAGE.MISSING_NODE,
                        concept.concept.name
                    ),
                    responses: [createYesResponse(), createNoResponse()],
                };
            }),
        ],
    };
}
