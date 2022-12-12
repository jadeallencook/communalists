import { AddressInterface } from './address';

export interface GroupInterface {
	name: string;
	bio: string;
	website: string;
	phone: string;
	email: string;
	address: AddressInterface;
}
