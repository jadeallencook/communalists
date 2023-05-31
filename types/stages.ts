export type StageKeyType =
    | 'submitted'
    | 'started'
    | 'ready'
    | 'complete'
    | 'cancelled';

export type StageType =
    | 'Received (1/4)'
    | 'Coordinating (2/4)'
    | 'Ready (3/4)'
    | 'Fulfilled (4/4)'
    | 'Cancelled';
