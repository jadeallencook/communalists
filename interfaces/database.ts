import { UserInterface } from './user';
import { ResourceInterface } from './resource';

export interface DatabaseInterface {
	users?: { [key: string]: UserInterface };
	resources?: { [key: string]: ResourceInterface };
}
