import {
	SubjectPronounType,
	ObjectPronounType,
	CountryType,
} from '../types/';

export interface UserInterface {
	name: string;
	SubjectPronoun: SubjectPronounType;
	ObjectPronoun: ObjectPronounType;
	country: CountryType;
	zipcode: string;
	isRemote: boolean;
}

