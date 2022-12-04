export interface ListingInterface {
	item: string;
	location: string;
	stock: number;
	description?: string;
	image?: string;
	attributes?: [string, string][];
	// attributes?: {[key: string]: string}
}
