import {
    SubjectPronounKeyType,
    SubjectPronounType,
    ObjectPronounKeyType,
    ObjectPronounType,
} from '@custom-types/pronouns';

export const subjectPronouns: {
    [key in SubjectPronounKeyType]: SubjectPronounType;
} = {
    he: 'He',
    she: 'She',
    they: 'They',
    xe: 'Xe',
    ze: 'Ze',
    any: 'Any',
};

export const objectPronouns: {
    [key in ObjectPronounKeyType]: ObjectPronounType;
} = {
    him: 'Him',
    her: 'Her',
    them: 'Them',
    xem: 'Xem',
    hir: 'Hir',
    all: 'All',
};
