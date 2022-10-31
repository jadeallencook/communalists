import { DatabaseInterface } from '../interfaces/database';
import { products } from './products';
import { resources } from './resources';
import { warehouses } from './warehouses';
import { organizations } from './organizations';
import { users } from './users';
import { handles } from './handles';

export const database: DatabaseInterface = {
	products,
	resources,
	warehouses,
	organizations,
	users,
	handles,
};
