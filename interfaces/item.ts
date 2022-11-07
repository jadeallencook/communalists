export interface ItemInterface {
	title: string;
	unit: string;
	attributes?: { [key: string]: { [key: string]: string } };
}
