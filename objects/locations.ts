import { LocationKeyType, LocationType } from '@custom-types/locations';

const locations: { [key in LocationKeyType]: LocationType } = {
    'santa-clara-ca': 'Santa Clara County (South Bay)',
    'san-mateo-ca': 'San Mateo County (Peninsula)',
    'alameda-ca': 'Alameda County (Easy Bay)',
    'contra-costa-ca': 'Contra Costa County (Easy Bay)',
    'san-francisco-ca': 'San Francisco County (San Francisco)',
};

export default locations;
