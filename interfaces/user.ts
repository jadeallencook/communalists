import {
	PrimaryOrThirdPersonPronounType,
	SecondayOrPossessivePronounType,
	CountryType,
} from '../types/';

export interface UserInterface {
	name: string;
	PrimaryOrThirdPersonPronoun: PrimaryOrThirdPersonPronounType;
	SecondayOrPossessivePronoun: SecondayOrPossessivePronounType;
	country: CountryType;
	zipcode: string;
	isRemote: boolean;
}

