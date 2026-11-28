import type { CommentView } from '@/lib/comments';

// Sample comments for stories (made up; not real people).

const day = 24 * 60 * 60 * 1000;
const base = Date.UTC(2026, 10, 20, 18, 0);

export const sampleComments: CommentView[] = [
    {
        id: 'c1',
        text: 'I’d add that mutual aid is about doing it together, not charity from above. The people giving help today may need it tomorrow.\n\nMaybe the short definition could say “neighbors” instead of “people”?',
        lang: 'en',
        at: base,
        votes: 12,
        hidden: false,
        author: { name: 'Maya Thompson', username: 'maya-thompson' },
        mine: false,
        voted: true,
    },
    {
        id: 'c2',
        text: 'En español también se dice “apoyo mutuo”. Podría estar en la explicación.',
        lang: 'es',
        at: base - 2 * day,
        votes: 4,
        hidden: false,
        author: { name: 'Luis Hernández', username: 'luis-hernandez' },
        mine: false,
        voted: false,
    },
    {
        id: 'c3',
        text: 'The longer part could give an example, like a free fridge or a ride share for appointments.',
        lang: 'en',
        at: base - 3 * day,
        votes: 0,
        hidden: false,
        author: { name: 'Sam Rivera', username: 'sam-rivera' },
        mine: true,
        voted: false,
    },
    {
        id: 'c4',
        text: null,
        lang: 'en',
        at: base - 5 * day,
        votes: 1,
        hidden: true,
        author: { name: 'Someone', username: 'someone' },
        mine: false,
        voted: false,
    },
];

export const formerMemberComment: CommentView = {
    id: 'c5',
    text: 'Thanks for writing this up.',
    lang: 'en',
    at: base - 9 * day,
    votes: 2,
    hidden: false,
    author: null,
    mine: false,
    voted: false,
};

export const longComment: CommentView = {
    id: 'c6',
    text: `${'Averyveryverylongwordwithoutanyspacesthatmustwraponphones '.repeat(2)}\n\n${'This is a long comment that goes on for a while, to check wrapping at 320 pixels wide and at 200% zoom. '.repeat(8)}`,
    lang: 'en',
    at: base - day,
    votes: 1234,
    hidden: false,
    author: {
        name: 'Nguyễn Thị Phương Thảo Elizabeth Montgomery-Hernández',
        username: 'thao',
    },
    mine: false,
    voted: false,
};

export const allowed = {
    reader: {
        vote: false,
        report: false,
        delete: false,
        hide: false,
        unhide: false,
    },
    member: {
        vote: true,
        report: true,
        delete: false,
        hide: false,
        unhide: false,
    },
    author: {
        vote: false,
        report: false,
        delete: true,
        hide: false,
        unhide: false,
    },
    moderator: {
        vote: true,
        report: false,
        delete: true,
        hide: true,
        unhide: false,
    },
    moderatorHidden: {
        vote: false,
        report: false,
        delete: true,
        hide: false,
        unhide: true,
    },
};
