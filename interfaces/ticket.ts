import { aidCoordinatorStatusType, driverStatusType } from "@custom-types/ticket";
import { ListingInterface } from "./listing";

export interface TicketInterface {
    orderId: string,
    group: string,
    items: { [key:string]: ListingInterface },
    assignedCoordinator: string,
    assignedDriver: string,
    coordinatorStatus: aidCoordinatorStatusType,
    driverStatus: driverStatusType,
    reimbursementStatus?: string,
    lastUpdated: string,
}