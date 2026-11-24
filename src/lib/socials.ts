// Social links on organizations and profiles. People type a handle; we store
// only the handle and build the link ourselves, so a stored link can never
// point anywhere but the platform's own profile page. Pure (no React, Next or
// Firebase). Design: documentation/features/16-organizations.md (decision #32).

interface PlatformSpec {
    name: string;
    /** Hosts a pasted link may be on (www. is ignored). */
    domains: readonly string[];
    /** What the field shows before the handle, e.g. "instagram.com/". */
    prefix: string;
    /** Allowed handle, without any leading @. */
    pattern: RegExp;
    /** The handle from a pasted link's path segments, or null. */
    fromPath: (segments: string[]) => string | null;
    /** Turns a valid handle into its canonical stored form. */
    normalize?: (handle: string) => string;
}

const first = (s: string[]) => (s.length === 1 ? s[0] : null);
const atFirst = (s: string[]) =>
    s.length === 1 && s[0].startsWith('@') ? s[0].slice(1) : null;
const after = (segment: string) => (s: string[]) =>
    s.length === 2 && s[0] === segment ? s[1] : null;

/** Stored keys; never rename. Order is the order in the platform picker. */
export const SOCIAL_PLATFORMS = {
    instagram: {
        name: 'Instagram',
        domains: ['instagram.com'],
        prefix: 'instagram.com/',
        pattern: /^[A-Za-z0-9._]{1,30}$/,
        fromPath: first,
    },
    facebook: {
        name: 'Facebook',
        domains: ['facebook.com', 'fb.com'],
        prefix: 'facebook.com/',
        pattern: /^[A-Za-z0-9.-]{1,80}$/,
        fromPath: (s) =>
            s[0] === 'groups' || s[0] === 'profile.php' ? null : first(s),
    },
    facebookGroup: {
        name: 'Facebook group',
        domains: ['facebook.com', 'fb.com'],
        prefix: 'facebook.com/groups/',
        pattern: /^[A-Za-z0-9._-]{1,100}$/,
        fromPath: after('groups'),
    },
    x: {
        name: 'X',
        domains: ['x.com', 'twitter.com'],
        prefix: 'x.com/',
        pattern: /^[A-Za-z0-9_]{1,15}$/,
        fromPath: first,
    },
    bluesky: {
        name: 'Bluesky',
        domains: ['bsky.app'],
        prefix: 'bsky.app/profile/',
        // A domain name. A bare name means the default .bsky.social handle.
        pattern:
            /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i,
        fromPath: after('profile'),
        normalize: (h) =>
            h.includes('.')
                ? h.toLowerCase()
                : `${h.toLowerCase()}.bsky.social`,
    },
    tiktok: {
        name: 'TikTok',
        domains: ['tiktok.com'],
        prefix: 'tiktok.com/@',
        pattern: /^[A-Za-z0-9._]{2,24}$/,
        fromPath: atFirst,
    },
    youtube: {
        name: 'YouTube',
        domains: ['youtube.com'],
        prefix: 'youtube.com/@',
        pattern: /^[A-Za-z0-9._-]{3,30}$/,
        fromPath: atFirst,
    },
    telegram: {
        name: 'Telegram',
        domains: ['t.me', 'telegram.me'],
        prefix: 't.me/',
        pattern: /^[A-Za-z0-9_]{5,32}$/,
        fromPath: first,
    },
} as const satisfies Record<string, PlatformSpec>;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;
export const SOCIAL_PLATFORM_KEYS = Object.keys(
    SOCIAL_PLATFORMS
) as SocialPlatform[];

export interface SocialLink {
    platform: SocialPlatform;
    handle: string;
}

export type SocialHandleProblem = 'socialInvalid' | 'socialMismatch';

export function isSocialPlatform(value: unknown): value is SocialPlatform {
    return (
        typeof value === 'string' &&
        Object.prototype.hasOwnProperty.call(SOCIAL_PLATFORMS, value)
    );
}

function spec(platform: SocialPlatform): PlatformSpec {
    return SOCIAL_PLATFORMS[platform];
}

/** The path segments of a pasted link, or null if it isn't one of the platform's links. */
function linkSegments(platform: SocialPlatform, input: string) {
    const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    let url: URL;
    try {
        url = new URL(withScheme);
    } catch {
        return null;
    }
    const host = url.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
    if (!spec(platform).domains.includes(host)) return null;
    return url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
}

/**
 * What someone typed ("sbma", "@sbma" or a pasted link) as a stored handle.
 * A link must be the platform's own profile link; anything else is refused.
 */
export function parseSocialHandle(
    platform: SocialPlatform,
    input: string
): { handle: string } | { problem: SocialHandleProblem } {
    const p = spec(platform);
    let raw = input.trim();
    if (raw.includes('/')) {
        const segments = linkSegments(platform, raw);
        if (!segments) return { problem: 'socialMismatch' };
        const fromPath = p.fromPath(segments);
        if (fromPath === null) return { problem: 'socialMismatch' };
        raw = fromPath;
    }
    raw = raw.replace(/^@/, '');
    // "instagram.com" on its own is the site, not a handle.
    if (p.domains.includes(raw.toLowerCase().replace(/^www\./, '')))
        return { problem: 'socialMismatch' };
    if (!p.pattern.test(raw)) return { problem: 'socialInvalid' };
    return { handle: p.normalize ? p.normalize(raw) : raw };
}

/** The profile link for a stored handle. Always https and on the platform's domain. */
export function socialUrl(platform: SocialPlatform, handle: string): string {
    return `https://${spec(platform).prefix}${encodeURIComponent(handle)}`;
}

/** How a handle reads on a page: "@sbma" (Facebook names have no @). */
export function socialLabel(platform: SocialPlatform, handle: string): string {
    return platform === 'facebook' || platform === 'facebookGroup'
        ? handle
        : `@${handle}`;
}

/**
 * Reads stored links leniently. Older documents stored `{ platform, url }`;
 * those are turned into handles, and links that no longer fit (dropped
 * platforms such as Discord, or a link that isn't a profile) are left out.
 */
export function socialLinksOf(data: unknown): SocialLink[] {
    if (!Array.isArray(data)) return [];
    const links: SocialLink[] = [];
    for (const item of data) {
        const { platform, handle, url } = (item ?? {}) as Record<
            string,
            unknown
        >;
        let key = platform;
        // Older Facebook links may be groups.
        if (
            key === 'facebook' &&
            typeof url === 'string' &&
            /\/groups\//.test(url)
        )
            key = 'facebookGroup';
        if (!isSocialPlatform(key)) continue;
        const value =
            typeof handle === 'string'
                ? handle
                : typeof url === 'string'
                  ? url
                  : '';
        const parsed = parseSocialHandle(key, value);
        if ('handle' in parsed && !links.some((l) => l.platform === key))
            links.push({ platform: key, handle: parsed.handle });
    }
    return links;
}
