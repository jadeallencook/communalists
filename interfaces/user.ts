import { AddressInterface } from './address';
import { SubjectPronounType, ObjectPronounType } from '../types';

export interface UserInterface {
	name: string;
	groups?: { [key: string]: 1 | 0 };
	address?: AddressInterface;
	subjectPronoun: SubjectPronounType;
	objectPronoun: ObjectPronounType;
	isRemote: boolean;
}
