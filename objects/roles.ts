import { RoleKeyType, RoleType } from '@custom-types/role';

const roles: { [key in RoleKeyType]: RoleType } = {
    driver: 'Driver',
    coordinator: 'Coordinator',
};

export default roles;
