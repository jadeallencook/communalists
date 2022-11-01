import { ProductInterface } from '../interfaces';

const bedframe: ProductInterface = {
	title: 'Bed Frame',
	unit: 'unit(s)',
	types: ['Twin', 'Double', 'Queen', 'King'],
};

const shampoo: ProductInterface = {
	title: 'Shampoo',
	unit: 'bottle(s)',
	types: ['8oz', '16oz'],
};

const bodysoap: ProductInterface = {
	title: 'Body Soap',
	unit: 'bar(s)',
};

const cannedsoup: ProductInterface = {
	title: 'Canned Soup',
	unit: 'can(s)',
	types: ['Cream of Mushroom', 'Clam Chowder'],
};

export const products: { [key: string]: ProductInterface } = {
	bedframe,
	shampoo,
	bodysoap,
	cannedsoup,
};
