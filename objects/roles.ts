import { RoleKeyType, RoleType } from '@custom-types/role';

const roles: { [key in RoleKeyType]: RoleType } = {
    driver: 'Driver',
    coordinator: 'Coordinator',
    'tech-support': 'Tech Support',
    'social-media': 'Social Media',
};

export default roles;