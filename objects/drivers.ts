import { DriverKeyType, DriverType } from '@custom-types/driver';

const drivers: { [key in DriverKeyType]: DriverType } = {
    'not-assigned': 'No Driver Assigned',
    assigned: 'Has Assigned Driver',
};

export default drivers;
