import { UserInterface } from './user';
import { ListingInterface } from './listing';
import { GroupInterface } from './group';
import { ItemInterface } from './item';
import { CountyKeyType } from '../types';
import { LocationInterface } from './locations';

export interface DatabaseInterface {
	users?: { [key: string]: UserInterface };
	listings?: {
		[key in CountyKeyType]?: {
			[key: string]: { [key: string]: ListingInterface };
		};
	};
	groups?: { [key: string]: GroupInterface };
	items?: { [key: string]: ItemInterface };
	locations?: { [key: string]: { [key: string]: LocationInterface } };
	handles?: { [key: string]: string };
}
