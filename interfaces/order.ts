import { AddressInterface } from "./address";
import { OrderType, DriverStatusType, AidCoordinatorStatusType } from "@custom-types/order";

// TODO: Update types/interfaces when request form gets merged
export interface OrderInterface {
    id: string,
    requester: string,
    requestDate: Date,
    group: string,
    type: OrderType,
    description: string,
    location: AddressInterface,
    assignedTo: string,
    status: AidCoordinatorStatusType,
    driverStatus: DriverStatusType,
    lastUpdated: string,
}