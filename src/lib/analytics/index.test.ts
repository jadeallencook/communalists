import { describe, expect, it } from 'vitest';

import { readTracked, sanitizeAnalyticsPayload, track } from '.';

const origin = 'https://communalists.com';
const asAttributes = (record: Record<string, string>) =>
    Object.entries(record).map(([name, value]) => ({ name, value }));

describe('track and readTracked', () => {
    it('round-trips an event and its properties through attributes', () => {
        const attributes = track('org-website', {
            org: 'oakland-auto-club',
            url: 'https://example.org',
        });
        expect(attributes).toEqual({
            'data-analytics-event': 'org-website',
            'data-analytics-org': 'oakland-auto-club',
            'data-analytics-url': 'https://example.org',
        });
        expect(readTracked(asAttributes(attributes))).toEqual({
            event: 'org-website',
            data: { org: 'oakland-auto-club', url: 'https://example.org' },
        });
    });

    it('keeps camelCase property names', () => {
        const attributes = track('find-search', {
            city: 'us/ca/oakland',
            radius: '25',
            focusAreas: 'food',
            languages: '',
            reach: 'local',
        });
        expect(attributes['data-analytics-focus-areas']).toBe('food');
        expect(readTracked(asAttributes(attributes))?.data.focusAreas).toBe(
            'food'
        );
    });

    it('takes no properties for events without any', () => {
        expect(track('sign-up-submit')).toEqual({
            'data-analytics-event': 'sign-up-submit',
        });
    });

    it('ignores elements without an event', () => {
        expect(
            readTracked([{ name: 'data-analytics-org', value: 'x' }])
        ).toBeNull();
    });
});

describe('sanitizeAnalyticsPayload', () => {
    const send = (url: string, referrer = '') =>
        sanitizeAnalyticsPayload({ url, referrer, title: 'T' }, origin);

    it('passes ordinary pages through', () => {
        expect(send(`${origin}/en/organization/oakland-auto-club`)).toEqual({
            url: `${origin}/en/organization/oakland-auto-club`,
            referrer: '',
            title: 'T',
        });
    });

    it('keeps /find/organizations filters and the city path', () => {
        expect(
            send(
                `${origin}/es/find/organizations/us/ca/oakland?radius=10&focusAreas=food&focusAreas=housing`
            )?.url
        ).toBe(
            `${origin}/es/find/organizations/us/ca/oakland?radius=10&focusAreas=food&focusAreas=housing`
        );
    });

    it('drops every other query parameter and the hash', () => {
        expect(
            send(`${origin}/en/sign-in?next=/organization/x&email=a@b.c#top`)
                ?.url
        ).toBe(`${origin}/en/sign-in`);
        expect(
            send(`${origin}/en/find/organizations?country=US&placeId=5378538`)
                ?.url
        ).toBe(`${origin}/en/find/organizations`);
    });

    it('sends nothing from auth links or the super-user tools', () => {
        expect(
            send(`${origin}/en/auth/action?mode=resetPassword&oobCode=SECRET`)
        ).toBeNull();
        expect(send(`${origin}/auth/action?oobCode=SECRET`)).toBeNull();
        expect(send(`${origin}/zh/admin/import`)).toBeNull();
        expect(send(`${origin}/en/admin`)).toBeNull();
    });

    it('does not mistake look-alike paths for excluded ones', () => {
        expect(
            send(`${origin}/en/organization/admin-collective`)
        ).not.toBeNull();
        expect(send(`${origin}/en/authors`)).not.toBeNull();
    });

    it('sends nothing for another site or a broken URL', () => {
        expect(send('https://evil.example/en/find/organizations')).toBeNull();
        expect(send('http://[')).toBeNull();
    });

    it('cleans referrers: our pages keep their path, other sites their address', () => {
        expect(
            send(
                `${origin}/en/find/organizations`,
                '/en/auth/action?mode=resetPassword&oobCode=SECRET'
            )?.referrer
        ).toBe('/en/auth/action');
        expect(
            send(
                `${origin}/en/find/organizations`,
                '/en/find/organizations/us/ca/oakland?radius=10&x=1'
            )?.referrer
        ).toBe('/en/find/organizations/us/ca/oakland?radius=10');
        expect(
            send(
                `${origin}/en/find/organizations`,
                'https://www.google.com/search?q=mutual+aid+oakland'
            )?.referrer
        ).toBe('https://www.google.com/search');
    });
});
