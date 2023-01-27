export type OrderType =
    "Pickup" | 
    "Dropoff"

export type AidCoordinatorStatusType = 
    "Unassigned" | 
    "In Process" |
    "Contacted" |
    "Needs Driver" |
    "Driver Assigned" |
    "Completed" |
    "Cant Contact" |
    "Cancelled" |
    "Questionable"

export type DriverStatusType = 
    "Unassigned" |
    "Assigned" | 
    "In Progress" | 
    "Completed"