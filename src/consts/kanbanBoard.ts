import { AidCoordinatorStatusType, DriverStatusType } from "@custom-types/order"

export const AidCoordinatorStatusOptions: AidCoordinatorStatusType[] = [
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

export const DriverStatusOptions: DriverStatusType[] = [
    'Unassigned',
    'Assigned',
    'In Progress',
    'Completed'
]