import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

import {
    adjustCounts,
    charactersLeft,
    defaultLanguageFilter,
    emptyCounts,
    isLanguageFilter,
    COMMENT_LANGS,
    COMMENT_MAX,
    commentAbilities,
    commentInputSchema,
    commentTargetSchema,
    commentView,
    decodeCursor,
    definitionHref,
    discussionOpen,
    encodeCursor,
    mergePages,
    normalizeText,
    paragraphsOf,
    parseReportId,
    RATE_LIMIT,
    RATE_WINDOW_MS,
    rateCheck,
    readComment,
    reportId,
    tallyReasons,
    takesReplies,
    targetKey,
    targetPath,
    type CommentView,
    type StoredComment,
} from './index';

const word = { kind: 'definition', id: 'mutual-aid' } as const;
const org = { kind: 'organization', id: 'Xy7Qp2LmN0aBcDeFgH12' } as const;

describe('targets', () => {
    it('point at the word’s document, page and keys', () => {
        expect(targetPath(word)).toBe('definitions/mutual-aid');
        expect(definitionHref(word.id)).toBe('/dictionary/mutual-aid');
        expect(targetKey(word)).toBe('definition~mutual-aid');
    });

    it('point at the organization’s document by id', () => {
        expect(targetPath(org)).toBe('organizations/Xy7Qp2LmN0aBcDeFgH12');
        expect(targetKey(org)).toBe('organization~Xy7Qp2LmN0aBcDeFgH12');
    });

    it('only accept known kinds and ids of the right shape', () => {
        expect(commentTargetSchema.safeParse(word).success).toBe(true);
        expect(commentTargetSchema.safeParse(org).success).toBe(true);
        expect(
            commentTargetSchema.safeParse({
                kind: 'organization',
                id: 'seed-sbma',
            }).success
        ).toBe(true);
        for (const bad of [
            { kind: 'user', id: 'mutual-aid' },
            { kind: 'definition', id: '../users' },
            { kind: 'definition', id: 'Mutual-Aid' },
            { kind: 'definition', id: 'a' },
            { kind: 'organization', id: '../users' },
            { kind: 'organization', id: 'a~b' },
            { kind: 'organization', id: '' },
            { kind: 'organization', id: 'x'.repeat(41) },
        ])
            expect(commentTargetSchema.safeParse(bad).success).toBe(false);
    });

    it('take replies on organizations only', () => {
        expect(takesReplies('organization')).toBe(true);
        expect(takesReplies('definition')).toBe(false);
    });
});

describe('discussionOpen', () => {
    it('is always open on a word that exists', () => {
        expect(discussionOpen('definition', {})).toBe(true);
        expect(discussionOpen('definition', undefined)).toBe(false);
    });

    it('is open on active, listed organizations only', () => {
        const listed = { status: 'active', visibility: 'listed' };
        expect(discussionOpen('organization', listed)).toBe(true);
        // Unclaimed ones too: claimStatus doesn't matter.
        expect(
            discussionOpen('organization', {
                ...listed,
                claimStatus: 'unclaimed',
            })
        ).toBe(true);
        expect(
            discussionOpen('organization', {
                ...listed,
                visibility: 'unlisted',
            })
        ).toBe(false);
        expect(
            discussionOpen('organization', { ...listed, status: 'archived' })
        ).toBe(false);
        expect(discussionOpen('organization', undefined)).toBe(false);
        expect(discussionOpen('organization', {})).toBe(false);
    });
});

describe('commentInputSchema', () => {
    it('accepts the UI languages', () => {
        expect([...COMMENT_LANGS]).toEqual([...routing.locales]);
    });

    it('trims and tidies the text', () => {
        const parsed = commentInputSchema.parse({
            text: '  First line  \r\n\r\n\r\n\r\nSecond\u0007 line \n',
            lang: 'es',
        });
        expect(parsed).toEqual({
            text: 'First line\n\nSecond line',
            lang: 'es',
        });
    });

    it('needs some text, within the limit', () => {
        const issue = (text: string) =>
            commentInputSchema.safeParse({ text, lang: 'en' }).error?.issues[0]
                ?.message;
        expect(issue('   \n  ')).toBe('textRequired');
        expect(issue('a'.repeat(COMMENT_MAX + 1))).toBe('textTooLong');
        expect(issue('a'.repeat(COMMENT_MAX))).toBeUndefined();
        // Spaces around the text don't count against the limit.
        expect(issue(` ${'a'.repeat(COMMENT_MAX)} `)).toBeUndefined();
    });

    it('refuses other languages', () => {
        expect(
            commentInputSchema.safeParse({ text: 'hi', lang: 'fr' }).error
                ?.issues[0]?.message
        ).toBe('langInvalid');
    });
});

describe('text helpers', () => {
    it('counts characters the way the limit is checked', () => {
        expect(charactersLeft('  hello  ')).toBe(COMMENT_MAX - 5);
        expect(charactersLeft('a'.repeat(COMMENT_MAX + 3))).toBe(-3);
    });

    it('splits paragraphs on blank lines, keeping single line breaks', () => {
        expect(paragraphsOf('One\ntwo\n\nThree')).toEqual([
            'One\ntwo',
            'Three',
        ]);
        expect(normalizeText('a\n\n\n\nb')).toBe('a\n\nb');
    });
});

describe('rateCheck', () => {
    const now = 10 * RATE_WINDOW_MS;

    it('allows up to the limit in an hour, and stores the new time', () => {
        const recent = [now - 1000, now - 2000];
        expect(rateCheck(recent, now)).toEqual({
            allowed: true,
            recent: [now - 2000, now - 1000, now],
        });
    });

    it('forgets comments older than an hour', () => {
        const old = Array.from(
            { length: RATE_LIMIT },
            () => now - RATE_WINDOW_MS
        );
        expect(rateCheck(old, now)).toEqual({ allowed: true, recent: [now] });
    });

    it('refuses the next one and says when it will be allowed', () => {
        const times = Array.from(
            { length: RATE_LIMIT },
            (_, i) => now - 50 * 60 * 1000 + i * 60 * 1000
        );
        const result = rateCheck(times, now);
        expect(result.allowed).toBe(false);
        // Once the oldest one is an hour old.
        if (!result.allowed)
            expect(result.retryAt).toBe(times[0] + RATE_WINDOW_MS);
    });

    it('ignores junk in the stored list', () => {
        expect(
            rateCheck(['x' as unknown as number, now - 10], now).allowed
        ).toBe(true);
    });
});

describe('cursors', () => {
    it('round-trip, and refuse anything else', () => {
        const cursor = { votes: 3, at: 1764200000123 };
        expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
        for (const bad of ['', '3', '-1.5', '3.abc', '1.2.3', null, 4])
            expect(decodeCursor(bad)).toBeNull();
    });
});

describe('readComment', () => {
    it('fills in defaults for older or partial documents', () => {
        expect(
            readComment(
                'c1',
                { uid: 'u1', text: 'Hi', votes: -2, lang: 'fr' },
                undefined
            )
        ).toEqual({
            id: 'c1',
            uid: 'u1',
            text: 'Hi',
            lang: 'en',
            at: 0,
            votes: 0,
            hidden: false,
            reply: null,
        });
    });

    it('reads the organization’s reply', () => {
        expect(
            readComment(
                'c1',
                {
                    uid: 'u1',
                    text: 'Hi',
                    reply: {
                        uid: 'owner',
                        text: 'Thanks',
                        lang: 'es',
                        byTeam: true,
                    },
                },
                1,
                7
            )?.reply
        ).toEqual({
            uid: 'owner',
            text: 'Thanks',
            lang: 'es',
            at: 7,
            byTeam: true,
            hidden: false,
        });
        expect(
            readComment('c1', { uid: 'u1', text: 'Hi', reply: { uid: 'x' } }, 1)
                ?.reply
        ).toBeNull();
    });

    it('skips documents without an author or text', () => {
        expect(readComment('c1', { text: 'Hi' }, 1)).toBeNull();
        expect(readComment('c1', { uid: 'u1' }, 1)).toBeNull();
    });
});

describe('commentView', () => {
    const stored: StoredComment = {
        id: 'c1',
        uid: 'author',
        text: 'Hidden words',
        lang: 'vi',
        at: 5,
        votes: 2,
        hidden: true,
        reply: null,
    };
    const author = { name: 'Maya', username: 'maya' };
    const reply = {
        uid: 'owner-uid',
        text: 'Thanks for telling us.',
        lang: 'en',
        at: 9,
        byTeam: false,
        hidden: false,
    } as const;
    const answered: StoredComment = { ...stored, hidden: false, reply };

    it('shows the reply as from the organization or the team, never who wrote it', () => {
        const view = commentView(
            answered,
            author,
            { uid: null, moderator: false },
            new Set()
        );
        expect(view.reply).toEqual({
            text: 'Thanks for telling us.',
            lang: 'en',
            at: 9,
            from: 'organization',
            hidden: false,
        });
        expect(JSON.stringify(view)).not.toContain('owner-uid');
        expect(
            commentView(
                { ...answered, reply: { ...reply, byTeam: true } },
                author,
                { uid: null, moderator: false },
                new Set()
            ).reply?.from
        ).toBe('team');
    });

    it('leaves out a hidden reply’s text, and the reply of a hidden comment', () => {
        const hiddenReply = { ...answered, reply: { ...reply, hidden: true } };
        expect(
            commentView(
                hiddenReply,
                author,
                { uid: 'u2', moderator: false },
                new Set()
            ).reply
        ).toMatchObject({ text: null, hidden: true });
        expect(
            commentView(
                hiddenReply,
                author,
                { uid: 'm', moderator: true },
                new Set()
            ).reply?.text
        ).toBe('Thanks for telling us.');
        const underHidden = { ...answered, hidden: true };
        expect(
            commentView(
                underHidden,
                author,
                { uid: 'u2', moderator: false },
                new Set()
            ).reply
        ).toBeNull();
        expect(
            commentView(
                underHidden,
                author,
                { uid: 'm', moderator: true },
                new Set()
            ).reply
        ).not.toBeNull();
    });

    it('leaves out a hidden comment’s text for everyone but moderators', () => {
        const reader = commentView(
            stored,
            author,
            { uid: 'u2', moderator: false },
            new Set()
        );
        expect(reader.text).toBeNull();
        expect(reader.hidden).toBe(true);
        const moderator = commentView(
            stored,
            author,
            { uid: 'm', moderator: true },
            new Set()
        );
        expect(moderator.text).toBe('Hidden words');
    });

    it('says whether the viewer wrote it or voted for it', () => {
        const mine = commentView(
            stored,
            author,
            { uid: 'author', moderator: false },
            new Set()
        );
        expect(mine.mine).toBe(true);
        const voted = commentView(
            stored,
            author,
            { uid: 'u2', moderator: false },
            new Set(['c1'])
        );
        expect(voted).toMatchObject({ mine: false, voted: true });
        const signedOut = commentView(
            stored,
            null,
            { uid: null, moderator: false },
            new Set()
        );
        expect(signedOut).toMatchObject({
            mine: false,
            voted: false,
            author: null,
        });
    });
});

describe('commentAbilities', () => {
    const other = { mine: false, hidden: false, reply: null };
    const replyView = {
        text: 'Thanks',
        lang: 'en',
        at: 1,
        from: 'organization',
        hidden: false,
    } as const;
    const answered = { ...other, reply: replyView };

    it('lets signed-in people vote on and report others’ comments', () => {
        expect(
            commentAbilities(other, { signedIn: true, moderator: false })
        ).toEqual({
            vote: true,
            report: true,
            delete: false,
            hide: false,
            unhide: false,
            reply: false,
            replyReport: false,
            replyDelete: false,
            replyHide: false,
            replyUnhide: false,
        });
    });

    it('lets the organization reply once to each comment that isn’t hidden', () => {
        const replier = { signedIn: true, moderator: false, replier: true };
        expect(commentAbilities(other, replier).reply).toBe(true);
        expect(commentAbilities(answered, replier)).toMatchObject({
            reply: false,
            replyDelete: true,
            // Its own reply: nothing to report.
            replyReport: false,
        });
        expect(
            commentAbilities({ ...other, hidden: true }, replier).reply
        ).toBe(false);
        // Its owners and moderators still vote and report like anyone.
        expect(commentAbilities(other, replier)).toMatchObject({
            vote: true,
            report: true,
        });
    });

    it('lets others report a reply, and moderators hide or delete it', () => {
        expect(
            commentAbilities(answered, { signedIn: true, moderator: false })
        ).toMatchObject({
            replyReport: true,
            replyDelete: false,
            reply: false,
        });
        expect(
            commentAbilities(answered, { signedIn: false, moderator: false })
                .replyReport
        ).toBe(false);
        expect(
            commentAbilities(answered, { signedIn: true, moderator: true })
        ).toMatchObject({
            replyReport: false,
            replyDelete: true,
            replyHide: true,
            replyUnhide: false,
        });
        expect(
            commentAbilities(
                { ...other, reply: { ...replyView, hidden: true } },
                { signedIn: true, moderator: true }
            )
        ).toMatchObject({ replyHide: false, replyUnhide: true });
    });

    it('lets authors delete, but not vote on or report, their own', () => {
        expect(
            commentAbilities(
                { mine: true, hidden: false, reply: null },
                { signedIn: true, moderator: false }
            )
        ).toMatchObject({ vote: false, report: false, delete: true });
    });

    it('gives signed-out readers nothing to press', () => {
        expect(
            Object.values(
                commentAbilities(other, { signedIn: false, moderator: false })
            )
        ).toEqual(Array(10).fill(false));
    });

    it('lets moderators hide, show and delete, not report', () => {
        expect(
            commentAbilities(other, { signedIn: true, moderator: true })
        ).toMatchObject({
            report: false,
            delete: true,
            hide: true,
            unhide: false,
        });
        expect(
            commentAbilities(
                { mine: false, hidden: true, reply: null },
                { signedIn: true, moderator: true }
            )
        ).toMatchObject({ vote: false, hide: false, unhide: true });
    });
});

describe('mergePages', () => {
    const view = (id: string): CommentView => ({
        id,
        text: id,
        lang: 'en',
        at: 0,
        votes: 0,
        hidden: false,
        author: null,
        mine: false,
        voted: false,
        reply: null,
    });

    it('drops comments already shown (votes moved them between pages)', () => {
        expect(
            mergePages([view('a'), view('b')], [view('b'), view('c')]).map(
                (c) => c.id
            )
        ).toEqual(['a', 'b', 'c']);
    });
});

describe('reports', () => {
    it('have one id per comment that reads back', () => {
        const id = reportId(word, 'AbC123_-x');
        expect(id).toBe('definition~mutual-aid~AbC123_-x');
        expect(parseReportId(id)).toEqual({
            target: word,
            commentId: 'AbC123_-x',
            part: 'comment',
        });
    });

    it('have their own id for an organization’s reply', () => {
        const id = reportId(org, 'c1', 'reply');
        expect(id).toBe('organization~Xy7Qp2LmN0aBcDeFgH12~c1~reply');
        expect(parseReportId(id)).toEqual({
            target: org,
            commentId: 'c1',
            part: 'reply',
        });
        expect(reportId(org, 'c1')).toBe(
            'organization~Xy7Qp2LmN0aBcDeFgH12~c1'
        );
        expect(parseReportId(`${id}~more`)).toBeNull();
    });

    it('refuse malformed ids', () => {
        for (const bad of [
            'definition~mutual-aid',
            'x~mutual-aid~c1',
            'definition~mutual-aid~c/1',
            'a~b~c~d',
        ])
            expect(parseReportId(bad)).toBeNull();
    });

    it('tally reasons, most common first, skipping unknown ones', () => {
        expect(
            tallyReasons({ spam: 1, harassment: 3, nonsense: 9, other: 0 })
        ).toEqual([
            { reason: 'harassment', count: 3 },
            { reason: 'spam', count: 1 },
        ]);
        expect(tallyReasons(undefined)).toEqual([]);
    });
});

describe('languages', () => {
    it('start readers in their UI language, and moderators in all', () => {
        expect(defaultLanguageFilter('vi', false)).toBe('vi');
        expect(defaultLanguageFilter('vi', true)).toBe('all');
        expect(defaultLanguageFilter('fr', false)).toBe('all');
    });

    it('start everyone in all languages on organizations (not translated)', () => {
        expect(defaultLanguageFilter('vi', false, 'organization')).toBe('all');
    });

    it('only accept known filters', () => {
        for (const ok of ['all', 'en', 'es', 'vi', 'zh'])
            expect(isLanguageFilter(ok)).toBe(true);
        for (const bad of ['fr', '', null, 'ALL'])
            expect(isLanguageFilter(bad)).toBe(false);
    });

    it('count a new or removed comment in all and in its language', () => {
        const added = adjustCounts(emptyCounts(), 'es', 1);
        expect(added).toEqual({ all: 1, en: 0, es: 1, vi: 0, zh: 0 });
        expect(adjustCounts(added, 'es', -1)).toEqual(emptyCounts());
        // Never below zero.
        expect(adjustCounts(emptyCounts(), 'zh', -1).zh).toBe(0);
    });
});
