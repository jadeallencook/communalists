import { ObjectPronounType, SubjectPronounType } from '@custom-types/pronouns';

export default interface RequestAidInterface {
	name: string;
	subjectPronoun: SubjectPronounType;
	objectPronoun: ObjectPronounType;
	language: string;
	phone: string;
	email: string;
	preferredContactMethod: 'call' | 'text' | 'email';
	location: string;
	hasHearingDisability: boolean;
	hasTransportation: boolean;
	hasFluLikeSymptoms: boolean;
	hasHealthCondition: boolean;
	healthConditions: string;
	is18: boolean;
	needsPickup: boolean;
	needsTransportation: boolean;
	needsMedicalSupplies: boolean;
	needsCleaningSupplies: boolean;
	needsHomeCookedMeal: boolean;
	needHomeCleaning: boolean;
	needsCompanionship: boolean;
	needsSocialServices: boolean;
	needsPetCare: boolean;
	needsOther: string;
}
