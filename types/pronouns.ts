export type SubjectPronounType =
	| 'they'
	| 'she'
	| 'he'
	| 'xe'
	| 'ze'
	| 'any';
export type ObjectPronounType =
	| 'them'
	| 'her'
	| 'him'
	| 'they'
	| 'xem'
	| 'hir'
	| 'all';

export type PronounsType = [
	SubjectPronounType,
	ObjectPronounType
];
