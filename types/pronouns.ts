export type PrimaryOrThirdPersonPronounType =
	| 'they'
	| 'she'
	| 'he'
	| 'xe'
	| 'ze'
	| 'any';
export type SecondayOrPossessivePronounType =
	| 'them'
	| 'her'
	| 'him'
	| 'they'
	| 'xem'
	| 'hir'
	| 'all';

export type PronounsType = [
	PrimaryOrThirdPersonPronounType,
	SecondayOrPossessivePronounType
];
