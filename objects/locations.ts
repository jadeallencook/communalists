import { LocationKeyType, LocationType } from '@custom-types/locations';

const locations: { [key in LocationKeyType]: LocationType } = {
    'campbell-ca': 'Campbell',
    'cupertino-ca': 'Cupertino',
    'gilroy-ca': 'Gilroy',
    'los-altos-ca': 'Los Altos',
    'los-gatos-ca': 'Los Gatos',
    'milpitas-ca': 'Milpitas',
    'mountain-view-ca': 'Mountain View',
    'san-jose-ca': 'San Jose',
    'santa-clara-ca': 'Santa Clara',
    'sunnyvale-ca': 'Sunnyvale',
};

export default locations;
