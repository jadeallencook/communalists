export type OrderStatusType = 
    | 'Not Started'
    | 'In Progress'
    | 'Completed'

export type OrderType = 
    | 'Pickup'
    | 'Dropoff'

export type OrderTypes = [ OrderStatusType, OrderType ]