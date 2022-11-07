import { ItemInterface } from '../interfaces';

const bedframe: ItemInterface = {
	title: 'Bed Frame',
	unit: 'unit(s)',
	attributes: {
		size: {
			twin: 'Twin',
			double: 'Double',
			queen: 'Queen',
			king: 'King',
		},
	},
};

const shampoo: ItemInterface = {
	title: 'Shampoo',
	unit: 'bottle(s)',
	attributes: {
		size: {
			eight: '8oz',
			sixteen: '16oz',
		},
	},
};

const bodysoap: ItemInterface = {
	title: 'Body Soap',
	unit: 'bar(s)',
	attributes: {
		size: {
			eight: '8oz',
			sixteen: '16oz',
		},
	},
};

const cannedsoup: ItemInterface = {
	title: 'Canned Soup',
	unit: 'can(s)',
};

export const items: { [key: string]: ItemInterface } = {
	bedframe,
	shampoo,
	bodysoap,
	cannedsoup,
};
