import { DatabaseInterface } from '../interfaces/database';
import { items } from './items';
import { handles } from './handles';
import { johndoe } from './johndoe';
import { janedoe } from './janedoe';

export const database: DatabaseInterface = {
	items,
	listings: {
		'santa-clara-ca': {
			...janedoe.listings['santa-clara-ca'],
			...johndoe.listings['santa-clara-ca'],
		},
	},
	locations: {
		...janedoe.locations,
		...johndoe.locations,
	},
	groups: {
		...janedoe.groups,
	},
	users: {
		...janedoe.users,
		...johndoe.users,
	},
	handles,
};