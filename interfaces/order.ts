import { AddressInterface } from "./address";

export interface OrderInterface {
    id: string,
    requester: string,
    requestDate: Date,
    group: string,
    type: OrderType,
    description: string,
    location: AddressInterface,
    assignedTo: string,
    status: string,
    lastUpdated: string,
}

enum OrderType {
    pickup = "PICKUP",
    dropoff = "DROPOFF"
}