import { DriverKeyType, DriverType } from '@custom-types/driver';

const drivers: { [key in DriverKeyType]: DriverType } = {
    'not-assigned': 'Pending',
    assigned: 'Coordinated',
};

export default drivers;
