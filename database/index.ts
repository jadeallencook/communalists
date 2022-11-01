import { DatabaseInterface } from '../interfaces/database';
import { products } from './products';
import { handles } from './handles';
import { johndoe } from './johndoe';
import { janedoe } from './janedoe';

export const database: DatabaseInterface = {
	products,
	resources: {
		'santa-clara': {
			...janedoe.resources['santa-clara'],
			...johndoe.resources['santa-clara'],
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
