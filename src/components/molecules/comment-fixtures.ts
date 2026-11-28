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
        reply: null,
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
        reply: null,
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
        reply: null,
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
        reply: null,
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
    reply: null,
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
    reply: null,
};

const noReply = {
    reply: false,
    replyReport: false,
    replyDelete: false,
    replyHide: false,
    replyUnhide: false,
};

/** On an organization's page: a comment the organization answered. */
export const repliedComment: CommentView = {
    id: 'c7',
    text: 'They helped me move my mom’s things in one afternoon. But the sign-up form only works in English, and my mom only reads Vietnamese.',
    lang: 'en',
    at: base - 4 * day,
    votes: 7,
    hidden: false,
    author: { name: 'Thanh Nguyen', username: 'thanh' },
    mine: false,
    voted: false,
    reply: {
        text: 'Thank you, and you’re right. We’re translating the form into Vietnamese and Spanish this month. Until then, call us and we’ll fill it in with you.',
        lang: 'en',
        at: base - 3 * day,
        from: 'organization',
        hidden: false,
    },
};

/** Answered by the Communalists team while the page was unclaimed. */
export const teamRepliedComment: CommentView = {
    ...repliedComment,
    id: 'c8',
    text: 'Does this group still meet? The last post I can find is from last year.',
    votes: 2,
    author: { name: 'Marcus Lee', username: 'marcus' },
    reply: {
        text: 'Thanks. We’ve asked them and will update the page when they answer.',
        lang: 'en',
        at: base - day,
        from: 'team',
        hidden: false,
    },
};

export const allowed = {
    reader: {
        vote: false,
        report: false,
        delete: false,
        hide: false,
        unhide: false,
        ...noReply,
    },
    member: {
        vote: true,
        report: true,
        delete: false,
        hide: false,
        unhide: false,
        ...noReply,
    },
    author: {
        vote: false,
        report: false,
        delete: true,
        hide: false,
        unhide: false,
        ...noReply,
    },
    moderator: {
        vote: true,
        report: false,
        delete: true,
        hide: true,
        unhide: false,
        ...noReply,
    },
    moderatorHidden: {
        vote: false,
        report: false,
        delete: true,
        hide: false,
        unhide: true,
        ...noReply,
    },
};

/** On an organization's page: what owners and moderators, and others, can do with its replies. */
export const allowedOnOrganization = {
    /** Owners and moderators: Reply on unanswered comments, Delete their reply. */
    replier: { ...allowed.member, reply: true },
    replierAnswered: { ...allowed.member, replyDelete: true },
    /** Anyone else signed in: Report a reply. */
    memberAnswered: { ...allowed.member, replyReport: true },
    /** Super users: Hide and Delete on replies too. */
    moderatorAnswered: {
        ...allowed.moderator,
        replyDelete: true,
        replyHide: true,
    },
    moderatorReplyHidden: {
        ...allowed.moderator,
        replyDelete: true,
        replyUnhide: true,
    },
};
