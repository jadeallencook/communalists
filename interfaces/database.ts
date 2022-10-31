import { UserInterface } from './user';
import { ResourceInterface } from './resource';
import { OrganizationInterface } from './organization';
import { ProductInterface } from './product';
import { CountyKeyType } from '../types';
import { WarehouseInterface } from './warehouse';

export interface DatabaseInterface {
	users?: { [key: string]: UserInterface };
	resources?: {
		[key in CountyKeyType]?: {
			[key: string]: { [key: string]: ResourceInterface };
		};
	};
	organizations?: { [key: string]: OrganizationInterface };
	products?: { [key: string]: ProductInterface };
	warehouses?: { [key: string]: { [key: string]: WarehouseInterface } };
	handles?: { [key: string]: string };
}
