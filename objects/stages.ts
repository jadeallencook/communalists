import { StageType, StageKeyType } from '@custom-types/stages';

const stages: { [key in StageKeyType]: StageType } = {
    unassigned: 'Unassigned',
    'in-process': 'In Process',
    contacted: 'Contacted',
    'needs-driver': 'Needs Driver',
    'driver-assigned': 'Driver Assigned',
    completed: 'Completed',
    'cant-contact': "Can't Contact",
    cancelled: 'Cancelled',
    questionable: 'Questionable',
};

export default stages;
