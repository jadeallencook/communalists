import { StageType, StageKeyType } from '@custom-types/stages';

const stages: { [key in StageKeyType]: StageType } = {
    submitted: 'Received (1/4)',
    started: 'Coordinating (2/4)',
    ready: 'Ready (3/4)',
    complete: 'Fulfilled (4/4)',
    cancelled: 'Cancelled',
};

export default stages;
