import {
    RequestStageType,
    RequestStageKeyType,
    ActionStageKeyType,
    ActionStageType,
} from '@custom-types/stages';

export const REQUEST_STAGES: {
    [key in RequestStageKeyType]: RequestStageType;
} = {
    submitted: 'Received (1/4)',
    started: 'Coordinating (2/4)',
    ready: 'Ready (3/4)',
    complete: 'Fulfilled (4/4)',
    cancelled: 'Cancelled',
};

export const ACTION_STAGES: {
    [key in ActionStageKeyType]: ActionStageType;
} = {
    submitted: 'Unassigned',
    started: 'Started',
    complete: 'Complete',
    cancelled: 'Cancelled',
};
