export interface ItemAttributeInterface {
	[key: string]: { [key: string]: string };
}

export interface ItemInterface {
	title: string;
	unit: string;
	attributes?: ItemAttributeInterface;
}
