import {
    OrganizationKeyType,
    OrganizationType,
} from '@custom-types/organizations';

const organizations: { [key in OrganizationKeyType]: OrganizationType } = {
    NONE: 'None',
    SBMA: 'South Bay Mutual Aid',
};

export default organizations;
