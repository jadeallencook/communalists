export interface OrderInterface {
    id: string,
    requester: string,
    requestDate: Date,
    type: OrderType,
    location: string,
    assignedTo: string,
    status: string,
    lastUpdated: string,
    completionDate: string
}

enum OrderType {
    pickup = "PICKUP",
    dropoff = "DROPOFF"
}