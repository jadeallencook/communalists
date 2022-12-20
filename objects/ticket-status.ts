import { aidCoordinatorStatusType, driverStatusType, reimbursementStatusType } from '../types/ticket'

export const AID_COORDINATOR_STATUS: aidCoordinatorStatusType[] = [
    'Unassigned',
    'In Process',
    'Contacted',
    'Needs Driver',
    'Driver Assigned',
    'Completed',
    'Cant Contact',
    'Cancelled',
    'Questionable',
]

export const DRIVER_STATUS: driverStatusType[] = [
    'Unassigned',
    'In Progress',
    'Completed'
]

export const REIMBURSEMENT_STATUS: reimbursementStatusType[] = [
    'Needs Reimbursement',
    'Reimbursed'
]