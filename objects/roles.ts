import { RoleKeyType, RoleType } from '@custom-types/role';

const roles: { [key in RoleKeyType]: RoleType } = {
    driver: 'Driver',
    coordinator: 'Coordinator',
    security: 'Security',
    tech: 'Tech Support',
    social: 'Social Media',
    photographer: 'Photography',
    laborer: 'General Labor',
    cook: 'Meal Prep',
    planner: 'Event Planning',
    designer: 'Graphic Design',
    emotional: 'Emotional Support',
    legal: 'Legal Support',
    medical: 'Medical Support',
};

export default roles;
