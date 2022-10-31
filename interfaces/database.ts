import { UserInterface } from './user';
import { ResourceInterface } from './resource';
import { OrganizationInterface } from './organization';

export interface DatabaseInterface {
	users?: { [key: string]: UserInterface };
	resources?: { [key: string]: ResourceInterface };
	organizations?: { [key: string]: OrganizationInterface }
}
