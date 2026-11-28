import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

import {
    charactersLeft,
    COMMENT_LANGS,
    COMMENT_MAX,
    commentAbilities,
    commentInputSchema,
    commentTargetSchema,
    commentView,
    decodeCursor,
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
    targetHref,
    targetKey,
    targetPath,
    type CommentView,
    type StoredComment,
} from './index';

const word = { kind: 'definition', id: 'mutual-aid' } as const;

describe('targets', () => {
    it('point at the word’s document, page and keys', () => {
        expect(targetPath(word)).toBe('definitions/mutual-aid');
        expect(targetHref(word)).toBe('/dictionary/mutual-aid');
        expect(targetKey(word)).toBe('definition~mutual-aid');
    });

    it('only accept known kinds and slug-shaped ids', () => {
        expect(commentTargetSchema.safeParse(word).success).toBe(true);
        for (const bad of [
            { kind: 'organization', id: 'mutual-aid' },
            { kind: 'definition', id: '../users' },
            { kind: 'definition', id: 'Mutual-Aid' },
            { kind: 'definition', id: 'a' },
        ])
            expect(commentTargetSchema.safeParse(bad).success).toBe(false);
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
        });
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
    };
    const author = { name: 'Maya', username: 'maya' };

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
    const other = { mine: false, hidden: false };

    it('lets signed-in people vote on and report others’ comments', () => {
        expect(
            commentAbilities(other, { signedIn: true, moderator: false })
        ).toEqual({
            vote: true,
            report: true,
            delete: false,
            hide: false,
            unhide: false,
        });
    });

    it('lets authors delete, but not vote on or report, their own', () => {
        expect(
            commentAbilities(
                { mine: true, hidden: false },
                { signedIn: true, moderator: false }
            )
        ).toMatchObject({ vote: false, report: false, delete: true });
    });

    it('gives signed-out readers nothing to press', () => {
        expect(
            Object.values(
                commentAbilities(other, { signedIn: false, moderator: false })
            )
        ).toEqual([false, false, false, false, false]);
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
                { mine: false, hidden: true },
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
        });
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
