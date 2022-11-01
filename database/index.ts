import { DatabaseInterface } from '../interfaces/database';
import { products } from './products';
import { handles } from './handles';
import { johndoe } from './johndoe';
import { janedoe } from './janedoe';

export const database: DatabaseInterface = {
	products,
	resources: {
		'santa-clara-ca': {
			...janedoe.resources['santa-clara-ca'],
			...johndoe.resources['santa-clara-ca'],
		},
	},
	warehouses: {
		...janedoe.warehouses,
		...johndoe.warehouses,
	},
	organizations: {
		...janedoe.organizations,
	},
	users: {
		...janedoe.users,
		...johndoe.users,
	},
	handles,
};
