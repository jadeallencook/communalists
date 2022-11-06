export interface ProductInterface {
	title: string;
	unit: string;
	attributes?: { [key: string]: { [key: string]: string } };
}
