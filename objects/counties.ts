import { USStateType } from '../types';
import { CountyType, CountyKeyType } from '../types';

export const counties: {
	[state in USStateType]?: { [county in CountyKeyType]: CountyType };
} = {
	CA: {
		'san-mateo': 'San Mateo',
		'san-francisco': 'San Francisco',
	},
};
