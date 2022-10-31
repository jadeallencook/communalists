import { AddressInterface } from './address';

export interface OrganizationInterface {
	name: string;
	bio: string;
	website: string;
	phone: number;
	email: string;
	address: AddressInterface;
}
