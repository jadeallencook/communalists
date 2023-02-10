import { LocationKeyType, LocationType } from '@custom-types/locations';

const locations: { [key in LocationKeyType]: LocationType } = {
	'santa-clara-ca': 'Santa Clara',
	'san-mateo-ca': 'San Mateo',
	'san-francisco-ca': 'San Francisco',
};

export default locations;
