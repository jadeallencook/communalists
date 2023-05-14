export type SubjectPronounKeyType = 'they' | 'she' | 'he' | 'xe' | 'ze' | 'any';
export type ObjectPronounKeyType =
    | 'them'
    | 'her'
    | 'him'
    | 'them'
    | 'xem'
    | 'hir'
    | 'all';

export type SubjectPronounType = 'They' | 'She' | 'He' | 'Xe' | 'Ze' | 'Any';
export type ObjectPronounType =
    | 'Them'
    | 'Her'
    | 'Him'
    | 'Them'
    | 'Xem'
    | 'Hir'
    | 'All';

export type PronounsKeyType = [SubjectPronounKeyType, SubjectPronounType];
export type PronounsType = [SubjectPronounType, ObjectPronounType];
