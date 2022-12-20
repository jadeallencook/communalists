import { OrderStatusType, OrderType } from "@custom-types/order";
import { AddressInterface } from "./address";
import { TicketInterface } from "./ticket";

export interface order {
    requester: string,
    requestDate: Date,
    event: string,
    lastUpdated: string,
    type: OrderType,
    location: AddressInterface,
    orderStatus: OrderStatusType,
    tickets: { [key: string]: TicketInterface }
}