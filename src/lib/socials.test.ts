import { describe, expect, it } from 'vitest';

import {
    parseSocialHandle,
    SOCIAL_PLATFORM_KEYS,
    socialLabel,
    socialLinksOf,
    socialUrl,
} from './socials';

const ok = (handle: string) => ({ handle });

// These keys are stored in Firestore. Adding one: append it here too.
describe('stored keys are permanent', () => {
    it('keeps every platform key', () => {
        expect(SOCIAL_PLATFORM_KEYS).toEqual([
            'instagram',
            'facebook',
            'facebookGroup',
            'x',
            'bluesky',
            'tiktok',
            'youtube',
            'telegram',
        ]);
    });
});

describe('parseSocialHandle', () => {
    it('takes a plain handle, with or without @', () => {
        expect(parseSocialHandle('instagram', 'sbma')).toEqual(ok('sbma'));
        expect(parseSocialHandle('instagram', ' @sbma ')).toEqual(ok('sbma'));
        expect(parseSocialHandle('tiktok', '@sb.ma')).toEqual(ok('sb.ma'));
    });

    it("pulls the handle out of the platform's own links", () => {
        expect(
            parseSocialHandle('instagram', 'https://www.instagram.com/sbma/')
        ).toEqual(ok('sbma'));
        expect(
            parseSocialHandle('instagram', 'instagram.com/sbma?igsh=abc')
        ).toEqual(ok('sbma'));
        expect(parseSocialHandle('x', 'https://twitter.com/sbma')).toEqual(
            ok('sbma')
        );
        expect(parseSocialHandle('tiktok', 'tiktok.com/@sbma')).toEqual(
            ok('sbma')
        );
        expect(
            parseSocialHandle('youtube', 'https://m.youtube.com/@sbma')
        ).toEqual(ok('sbma'));
        expect(
            parseSocialHandle('facebookGroup', 'facebook.com/groups/sbma')
        ).toEqual(ok('sbma'));
        expect(
            parseSocialHandle('bluesky', 'https://bsky.app/profile/sbma.org')
        ).toEqual(ok('sbma.org'));
        expect(parseSocialHandle('telegram', 't.me/sbma_chat')).toEqual(
            ok('sbma_chat')
        );
    });

    it('gives Bluesky the default domain and lowercases it', () => {
        expect(parseSocialHandle('bluesky', 'SBMA')).toEqual(
            ok('sbma.bsky.social')
        );
        expect(parseSocialHandle('bluesky', '@SBMA.org')).toEqual(
            ok('sbma.org')
        );
    });

    it('refuses links that are not a profile on that platform', () => {
        const mismatch = { problem: 'socialMismatch' };
        expect(parseSocialHandle('facebook', 'instagram.com/sbma')).toEqual(
            mismatch
        );
        expect(
            parseSocialHandle('instagram', 'https://instagram.com.evil.io/x')
        ).toEqual(mismatch);
        expect(
            parseSocialHandle('instagram', 'https://evilinstagram.com/x')
        ).toEqual(mismatch);
        expect(
            parseSocialHandle('instagram', 'instagram.com/p/abc123')
        ).toEqual(mismatch);
        expect(
            parseSocialHandle('facebook', 'facebook.com/groups/sbma')
        ).toEqual(mismatch);
        expect(
            parseSocialHandle('facebook', 'facebook.com/profile.php?id=1')
        ).toEqual(mismatch);
        expect(parseSocialHandle('youtube', 'youtube.com/watch?v=abc')).toEqual(
            mismatch
        );
        expect(parseSocialHandle('instagram', 'instagram.com')).toEqual(
            mismatch
        );
        expect(
            parseSocialHandle('instagram', 'javascript:alert(1)//x')
        ).toEqual(mismatch);
    });

    it('refuses handles the platform would not allow', () => {
        const invalid = { problem: 'socialInvalid' };
        expect(parseSocialHandle('x', 'south bay')).toEqual(invalid);
        expect(parseSocialHandle('x', 'a_very_long_handle_name')).toEqual(
            invalid
        );
        expect(parseSocialHandle('telegram', 'abc')).toEqual(invalid);
        expect(parseSocialHandle('instagram', '')).toEqual(invalid);
        expect(parseSocialHandle('instagram', 'sb"ma')).toEqual(invalid);
        expect(parseSocialHandle('bluesky', 'bad..domain')).toEqual(invalid);
    });
});

describe('socialUrl', () => {
    it('always builds an https link on the platform', () => {
        expect(socialUrl('instagram', 'sbma')).toBe(
            'https://instagram.com/sbma'
        );
        expect(socialUrl('facebookGroup', 'sbma')).toBe(
            'https://facebook.com/groups/sbma'
        );
        expect(socialUrl('tiktok', 'sbma')).toBe('https://tiktok.com/@sbma');
        expect(socialUrl('youtube', 'sbma')).toBe('https://youtube.com/@sbma');
        expect(socialUrl('bluesky', 'sbma.bsky.social')).toBe(
            'https://bsky.app/profile/sbma.bsky.social'
        );
        expect(socialUrl('x', '../evil')).toBe('https://x.com/..%2Fevil');
    });
});

describe('socialLabel', () => {
    it('shows @handle, except for Facebook names', () => {
        expect(socialLabel('instagram', 'sbma')).toBe('@sbma');
        expect(socialLabel('facebook', 'sbma')).toBe('sbma');
    });
});

describe('socialLinksOf', () => {
    it('reads stored handles', () => {
        expect(socialLinksOf([{ platform: 'x', handle: 'sbma' }])).toEqual([
            { platform: 'x', handle: 'sbma' },
        ]);
    });

    it('turns older stored links into handles', () => {
        expect(
            socialLinksOf([
                {
                    platform: 'instagram',
                    url: 'https://www.instagram.com/sbma',
                },
                {
                    platform: 'facebook',
                    url: 'https://facebook.com/groups/sbma',
                },
            ])
        ).toEqual([
            { platform: 'instagram', handle: 'sbma' },
            { platform: 'facebookGroup', handle: 'sbma' },
        ]);
    });

    it('drops removed platforms, bad values and repeats', () => {
        expect(
            socialLinksOf([
                { platform: 'discord', url: 'https://discord.gg/abc' },
                { platform: 'whatsapp', url: 'https://wa.me/15555550100' },
                { platform: 'instagram', url: 'https://evil.com/x' },
                { platform: 'x', handle: 'a' },
                { platform: 'x', handle: 'b' },
                null,
                'junk',
            ])
        ).toEqual([{ platform: 'x', handle: 'a' }]);
        expect(socialLinksOf(undefined)).toEqual([]);
    });
});
