import { StageType, StageKeyType } from '@custom-types/stages';

const stages: { [key in StageKeyType]: StageType } = {
    submitted: 'Request Recieved',
    started: 'Coordinating',
    ready: 'Ready For Pickup',
    complete: 'Fulfilled',
};

export default stages;
