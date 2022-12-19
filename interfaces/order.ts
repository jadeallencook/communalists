import { TicketInterface } from "./ticket";

export interface order {
    [key: string]: { [key: string]: TicketInterface }
}