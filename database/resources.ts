import { ResourceInterface } from '../interfaces';
import { CountyKeyType } from '../types';

const resource1: ResourceInterface = {
	product: 'product1',
	warehouse: 'warehouse1',
	stock: 1,
	description: '',
	image: '',
};

const resource2: ResourceInterface = {
	product: 'product2',
	warehouse: 'warehouse2',
	stock: 2,
	description: '',
	image: '',
};

const resource3: ResourceInterface = {
	product: 'product3',
	warehouse: 'warehouse3',
	stock: 3,
	description: '',
	image: '',
};

const resource4: ResourceInterface = {
	product: 'product4',
	warehouse: 'warehouse4',
	stock: 4,
	description: '',
	image: '',
};

export const resources: {
	[key in CountyKeyType]?: {
		[key: string]: { [key: string]: ResourceInterface };
	};
} = {
	'santa-clara': {
		user1: { resource1, resource2 },
		organization1: { resource3, resource4 },
	},
};
