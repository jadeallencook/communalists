import { PartnerKeyType, PartnerType } from '@custom-types/partners';

const partners: { [key in PartnerKeyType]: PartnerType } = {
    NONE: 'None',
    SBMA: 'South Bay Mutual Aid',
};

export default partners;
