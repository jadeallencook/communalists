export type RequestStageKeyType =
    | 'submitted'
    | 'started'
    | 'ready'
    | 'complete'
    | 'cancelled';

export type RequestStageType =
    | 'Received (1/4)'
    | 'Coordinating (2/4)'
    | 'Ready (3/4)'
    | 'Fulfilled (4/4)'
    | 'Cancelled';

export type ActionStageKeyType =
    | 'submitted'
    | 'started'
    | 'complete'
    | 'cancelled';

export type ActionStageType =
    | 'Unassigned'
    | 'Started'
    | 'Complete'
    | 'Cancelled';

export type AnyStageKeyType = RequestStageKeyType & ActionStageKeyType;
