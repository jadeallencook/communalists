import { aidCoordinatorStatusType, driverStatusType } from "@custom-types/ticket-status";
import { AddressInterface } from "./address";
import { ItemInterface } from "./item";

export interface TicketInterface {
    orderId: string,
    ticketId: string,
    requester: string,
    requestDate: Date,
    group: string,
    type: OrderType,
    event: string,
    items: ItemInterface[],
    location: AddressInterface,
    assignedCoordinator: string,
    assignedDriver: string,
    coordinatorStatus: aidCoordinatorStatusType,
    driverStatus: driverStatusType,
    reimbursementStatus: string,
    lastUpdated: string,
}

type OrderType = 
    | 'Pickup'
    | 'Dropoff'