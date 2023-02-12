import { DriverKeyTypes, DriverTypes } from "@custom-types/driver";

const drivers: { [key in DriverKeyTypes]: DriverTypes } = {
    'not-assigned': 'Not Assigned',
    'assigned': 'Assigned'
};

export default drivers;
