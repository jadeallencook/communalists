import { DriverKeyType, DriverType } from '@custom-types/driver';

const drivers: { [key in DriverKeyType]: DriverType } = {
    'not-assigned': 'Not Assigned',
    assigned: 'Assigned',
};

export default drivers;
