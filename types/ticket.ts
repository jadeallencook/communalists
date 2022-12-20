export type aidCoordinatorStatusType =
	| 'Unassigned'
    | 'In Process'
    | 'Contacted'
    | 'Needs Driver'
    | 'Driver Assigned'
    | 'Completed'
    | 'Cant Contact'
    | 'Cancelled'
    | 'Questionable'

export type driverStatusType = 
    | 'Unassigned'
    | 'In Progress'
    | 'Completed'

export type reimbursementStatusType = 
    | 'Needs Reimbursement'
    | 'Reimbursed'

export type ticketStatusTypes = [aidCoordinatorStatusType, driverStatusType, reimbursementStatusType]