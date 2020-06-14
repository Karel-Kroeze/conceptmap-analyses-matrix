import {
    IResponse,
    MESSAGE,
    COOLDOWN,
    IResponseAction,
    IResponseActionType,
} from './ICriterion';
import { tryTranslate } from '../Helpers/translate';

const defaultAction: IResponseAction = {
    type: 'dismiss',
    cooldown: COOLDOWN.NORMAL,
    positive: true,
};

export function createResponse<T extends IResponseAction>(
    message: string,
    action: Partial<T>
): IResponse<IResponseAction> {
    return {
        message: tryTranslate(message),
        action: Object.assign({}, defaultAction, action),
    };
}

export function createOkResponse(
    positive = true,
    message = MESSAGE.OK,
    cooldown = COOLDOWN.NORMAL
): IResponse<IResponseAction> {
    return createResponse(message, { cooldown, positive, type: 'dismiss' });
}

export function createMoreResponse(
    positive = false,
    message: string,
    cooldown = COOLDOWN.NONE
): IResponse<IResponseAction> {
    return createResponse(message, { cooldown, positive, type: 'dismiss' });
}

export function createYesResponse(
    positive = true,
    message = MESSAGE.YES,
    cooldown = COOLDOWN.NORMAL
): IResponse<IResponseAction> {
    return createResponse(message, { cooldown, positive, type: 'dismiss' });
}

export function createNoResponse(
    positive = false,
    message = MESSAGE.NO,
    cooldown = COOLDOWN.NORMAL
): IResponse<IResponseAction> {
    return createResponse(message, { cooldown, positive, type: 'dismiss' });
}
