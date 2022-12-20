import { aidCoordinatorStatusType, driverStatusType } from "@custom-types/ticket";
import { ItemInterface } from "./item";

export interface TicketInterface {
    orderId: string,
    ticketId: string,
    group: string,
    items: ItemInterface[],
    assignedCoordinator: string,
    assignedDriver: string,
    coordinatorStatus: aidCoordinatorStatusType,
    driverStatus: driverStatusType,
    reimbursementStatus: string,
    lastUpdated: string,
}