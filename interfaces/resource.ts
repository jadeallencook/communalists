export interface ResourceInterface {
	product: string;
	warehouse: string;
	stock: number;
	description?: string;
	image?: string;
	attributes?: [string, string][];
}
