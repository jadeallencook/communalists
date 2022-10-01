import { Country, USState, Zipcode } from '../types';

interface Location {
	country: Country;
	state: USState;
	zipcode: Zipcode;
	street?: string;
}

export default Location;
