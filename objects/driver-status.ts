import { DriverKeyType, DriverType } from '@custom-types/driver';

export const DRIVER_STATUSES: { [key in DriverKeyType]: DriverType } = {
    'not-assigned': 'No Driver Assigned',
    assigned: 'Has Assigned Driver',
};
