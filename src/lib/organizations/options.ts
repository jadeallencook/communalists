// Fixed lists for organizations. Pure: shared by forms, validation, pages,
// tests and a future native app. Labels live in messages/*.json
// (Organizations.focusAreas.*, …); platform names are brands and aren't translated.
// Design: documentation/features/16-organizations.md.

/**
 * What a group works on ("focus areas"): pick 1 to MAX_FOCUS_AREAS.
 *
 * These keys are stored in Firestore, so they are permanent once shipped:
 * never rename or reuse one. To relabel, edit Organizations.focusAreas.* in
 * messages/*.json. To retire one, keep the key here, list it in
 * RETIRED_FOCUS_AREAS (hidden from forms, still shown on groups that have it).
 * options.test.ts locks this list. Decision #23.
 */
export const FOCUS_AREAS = [
    'general',
    'food',
    'housing',
    'transportation',
    'technology',
    'health',
    'childcare',
    'education',
    'clothing',
    'lending',
    'disasterRelief',
    'legal',
    'labor',
    'arts',
    'hobbies',
    'faith',
    'animals',
    'environment',
    'other',
] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

/** Keys kept for existing groups but no longer offered. None yet. */
export const RETIRED_FOCUS_AREAS: readonly FocusArea[] = [];

/** Focus areas the create and edit forms offer. */
export const OFFERED_FOCUS_AREAS = FOCUS_AREAS.filter(
    (area) => !RETIRED_FOCUS_AREAS.includes(area)
);

/** Enough to say what a group does without ticking every box to show up everywhere. */
export const MAX_FOCUS_AREAS = 3;

export const REACH_SCOPES = ['local', 'national', 'international'] as const;
export type ReachScope = (typeof REACH_SCOPES)[number];

/** Radius choices for local groups, in miles (stored in km). */
export const RADIUS_MILES = [5, 10, 25, 50, 100] as const;
export type RadiusMiles = (typeof RADIUS_MILES)[number];
export const milesToKm = (miles: number) => Math.round(miles * 1.609344);

export const JOIN_POLICIES = ['request', 'open', 'invite'] as const;
export type JoinPolicy = (typeof JOIN_POLICIES)[number];

export const VISIBILITIES = ['listed', 'unlisted'] as const;
export type Visibility = (typeof VISIBILITIES)[number];

/**
 * Who sees every member's name on the group's page. Owners and moderators are
 * always listed, and everyone sees the count. Missing on older groups: read
 * it with `memberListVisibilityOf`.
 */
export const MEMBER_LIST_VISIBILITIES = [
    'public',
    'members',
    'hidden',
] as const;
export type MemberListVisibility = (typeof MEMBER_LIST_VISIBILITIES)[number];
export const DEFAULT_MEMBER_LIST_VISIBILITY: MemberListVisibility = 'members';
export const memberListVisibilityOf = (value: unknown): MemberListVisibility =>
    (MEMBER_LIST_VISIBILITIES as readonly unknown[]).includes(value)
        ? (value as MemberListVisibility)
        : DEFAULT_MEMBER_LIST_VISIBILITY;

/**
 * Languages a group can say it works in (BCP 47). Names come from
 * Intl.DisplayNames in the visitor's language, so they need no translation.
 * `ase` is American Sign Language.
 */
export const ORG_LANGUAGES = [
    'en',
    'es',
    'vi',
    'zh',
    'tl',
    'ko',
    'ja',
    'ar',
    'fa',
    'hi',
    'pa',
    'pt',
    'ru',
    'fr',
    'am',
    'so',
    'ase',
] as const;
export type OrgLanguage = (typeof ORG_LANGUAGES)[number];

/** Most organizations one person can own (decision #22). */
export const MAX_OWNED_ORGANIZATIONS = 5;

/** "https://…" URL, adding https:// when a scheme is missing; null if it isn't a web address. */
export function normalizeWebUrl(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    try {
        const url = new URL(withScheme);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        if (!url.hostname.includes('.')) return null;
        url.protocol = 'https:';
        return url.toString();
    } catch {
        return null;
    }
}
