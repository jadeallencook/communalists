import { USStateType, CountyType } from '../types';

export interface AddressInterface {
	street: string;
	city: string;
	state: USStateType;
	zipcode: string;
	county: CountyType;
}
