import { WarehouseInterface } from '../interfaces';

const warehouse1: WarehouseInterface = {
	street: '1 Main Street',
	city: 'San Jose',
	state: 'CA',
	zipcode: 95112,
	county: 'Santa Clara',
};

const warehouse2: WarehouseInterface = {
	street: '2 Main Street',
	city: 'San Jose',
	state: 'CA',
	zipcode: 95113,
	county: 'Santa Clara',
};

const warehouse3: WarehouseInterface = {
	street: '3 Main Street',
	city: 'San Jose',
	state: 'CA',
	zipcode: 95113,
	county: 'Santa Clara',
};
const warehouse4: WarehouseInterface = {
	street: '4 Main Street',
	city: 'San Jose',
	state: 'CA',
	zipcode: 95113,
	county: 'Santa Clara',
};

export const warehouses: {
	[key: string]: { [key: string]: WarehouseInterface };
} = {
	organization1: {
		warehouse1,
		warehouse2,
		warehouse3,
	},
	user1: {
		warehouse4,
	},
};
