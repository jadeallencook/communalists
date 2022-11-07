import { AddressInterface } from './address';

export interface GroupInterface {
	name: string;
	bio: string;
	website: string;
	phone: number;
	email: string;
	address: AddressInterface;
}
