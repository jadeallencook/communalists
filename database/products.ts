import { ProductInterface } from '../interfaces';

const product1: ProductInterface = {
	title: 'Product 1',
	unit: 'unit(s)',
};

const product2: ProductInterface = {
	title: 'Product 2',
	unit: 'unit(s)',
};

const product3: ProductInterface = {
	title: 'Product 3',
	unit: 'unit(s)',
};

const product4: ProductInterface = {
	title: 'Product 4',
	unit: 'unit(s)',
};

export const products: { [key: string]: ProductInterface } = {
	product1,
	product2,
	product3,
	product4,
};
