import {
    OrganizationKeyType,
    OrganizationType,
} from '@custom-types/organizations';

const organizations: { [key in OrganizationKeyType]: OrganizationType } = {
    NONE: 'No Association',
    SBMA: 'South Bay Mutual Aid',
    SJFNB: 'San Jose Food Not Bombs',
    SVDSA: 'Silicon Valley Democratic Socialists of America',
};

export default organizations;
