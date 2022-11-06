import { ProductInterface } from '../interfaces';

const bedframe: ProductInterface = {
	title: 'Bed Frame',
	unit: 'unit(s)',
	attributes: {
		sizes: {
			twin: 'Twin',
			double: 'Double',
			queen: 'Queen',
			king: 'King',
		},
	},
};

const shampoo: ProductInterface = {
	title: 'Shampoo',
	unit: 'bottle(s)',
	attributes: {
		sizes: {
			eight: '8oz',
			sixteen: '16oz',
		},
	},
};

const bodysoap: ProductInterface = {
	title: 'Body Soap',
	unit: 'bar(s)',
	attributes: {
		sizes: {
			eight: '8oz',
			sixteen: '16oz',
		},
	},
};

const cannedsoup: ProductInterface = {
	title: 'Canned Soup',
	unit: 'can(s)',
};

export const products: { [key: string]: ProductInterface } = {
	bedframe,
	shampoo,
	bodysoap,
	cannedsoup,
};
