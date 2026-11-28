// Analytics (Umami): which events we send, the attributes that name a
// clickable element's event, and what leaves the browser. Pure: no React,
// Next or DOM, so it's tested directly. The browser side is ./browser.ts and
// src/app/[locale]/analytics.tsx. Design: documentation/technical/analytics.md.

import type { CommentTargetKind } from '../comments';
import type { NavKey } from '../navigation';

/** Umami Cloud website id for communalists.com. Public: it's in the page source. */
export const UMAMI_WEBSITE_ID = 'a1687831-6fc3-4e0b-9c0c-7448fad2d67d';
export const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';
/** The tracker only sends from these hostnames (never previews or localhost). */
export const UMAMI_DOMAINS = 'communalists.com';

/**
 * Every event, with the properties it carries. Names are stable keys (kebab
 * case, ≤ 50 characters), never UI text, so reports survive copy changes and
 * read the same in every language. `org` is always the organization's
 * handle. Never add personal data (names, emails, phone numbers, typed text).
 */
export interface AnalyticsEvents {
    /** An organization's page was opened. */
    'org-view': { org: string };
    /** An organization's name was clicked in a list. */
    'org-open': { org: string; from: 'find' | 'card' };
    /** A /find/organizations result was expanded. */
    'org-details': { org: string };
    'org-website': { org: string; url: string };
    'org-social': { org: string; platform: string };
    'org-phone': { org: string };
    'org-email': { org: string };
    'org-directions': { org: string; provider: string };
    /** Join or Ask to join was pressed (an attempt; the server may refuse). */
    'org-join': { org: string; policy: 'open' | 'request' };
    /** Signed out, "Sign in to join" was pressed. */
    'org-join-sign-in': { org: string };
    'org-cancel-request': { org: string };
    'org-leave': { org: string };
    /** "Claim this organization" on an unclaimed one. */
    'org-claim': { org: string };
    'org-claim-submit': { org: string };
    /** An organization search (/find/organizations) was shown. `city` is its path ("us/ca/oakland"). */
    'find-search': {
        city: string;
        radius: string;
        focusAreas: string;
        languages: string;
        reach: string;
    };
    'browse-organizations': { from: 'hero' | 'dashboard' | 'nearby' };
    'create-organization': { from: 'dashboard' | 'find' };
    'create-organization-submit': Record<string, never>;
    'sign-up': { from: 'header' | 'hero' };
    'sign-in': { from: 'header' };
    'sign-up-submit': Record<string, never>;
    'sign-in-submit': Record<string, never>;
    'language-change': { to: string };
    /** A site section was chosen in the header (wide screens) or the phone menu. */
    'nav-link': { to: NavKey; from: 'header' | 'menu' };
    /** The phone menu was opened. */
    'menu-open': Record<string, never>;
    /** A dictionary word's page was opened. `slug` is the word's slug. */
    'definition-view': { slug: string };
    /** A word marked in our copy (<Definition>) was chosen, opening its page. */
    'definition-open': { slug: string };
    /** "Copy link" was pressed on a word's page. */
    'definition-share': { slug: string };
    /**
     * Signed out, "Create an account" or "Sign in" was pressed in a
     * discussion. `on` is the target's kind (`definition`), `id` its slug.
     */
    'discussion-join': {
        on: CommentTargetKind;
        id: string;
        to: 'sign-up' | 'sign-in';
    };
    /** "Post comment" was pressed (an attempt; the server may refuse). Never the text. */
    'comment-post': { on: CommentTargetKind; id: string };
}

export type AnalyticsEvent = keyof AnalyticsEvents;
export type AnalyticsData = Record<string, string>;

const EVENT_ATTRIBUTE = 'data-analytics-event';
const PROPERTY_PREFIX = 'data-analytics-';

/**
 * Attributes that make a link or button report `event` when it's clicked
 * (or activated with the keyboard): spread them onto the element.
 * `<a {...track('org-website', { org, url })}>`. Property names must be
 * camelCase words; they come back unchanged (readTracked).
 */
export function track<E extends AnalyticsEvent>(
    event: E,
    ...[data]: AnalyticsEvents[E] extends Record<string, never>
        ? []
        : [AnalyticsEvents[E]]
): Record<string, string> {
    const attributes: Record<string, string> = { [EVENT_ATTRIBUTE]: event };
    for (const [key, value] of Object.entries(data ?? {}))
        attributes[PROPERTY_PREFIX + kebab(key)] = String(value);
    return attributes;
}

/** The event and properties from an element's attributes, as `track` wrote them. */
export function readTracked(
    attributes: Iterable<{ name: string; value: string }>
): { event: string; data: AnalyticsData } | null {
    let event: string | null = null;
    const data: AnalyticsData = {};
    for (const { name, value } of attributes) {
        if (name === EVENT_ATTRIBUTE) event = value;
        else if (name.startsWith(PROPERTY_PREFIX))
            data[camel(name.slice(PROPERTY_PREFIX.length))] = value;
    }
    return event ? { event, data } : null;
}

export const TRACKED_SELECTOR = `[${EVENT_ATTRIBUTE}]`;

const kebab = (key: string) =>
    key.replace(/[A-Z]/g, (c) => `-${c}`).toLowerCase();
const camel = (key: string) =>
    key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/**
 * Pages we never report: sign-in links from emails (/auth/action carries a
 * one-time code) and the super-user tools (/admin). With or without a locale.
 */
const EXCLUDED_PATH = /^\/(?:(?:en|es|vi|zh)\/)?(?:auth|admin)(?:\/|$)/;

/**
 * The only query parameters that leave the browser: /find/organizations' filters. Any
 * other one (a reset code, ?next=, whatever is added later) is dropped,
 * so a new parameter is private until someone adds it here.
 */
export const KEPT_QUERY_PARAMETERS = [
    'radius',
    'focusAreas',
    'languages',
    'reach',
] as const;

function cleanUrl(url: URL): URL {
    const clean = new URL(url.origin + url.pathname);
    for (const key of KEPT_QUERY_PARAMETERS)
        for (const value of url.searchParams.getAll(key))
            clean.searchParams.append(key, value);
    return clean;
}

interface Payload {
    url?: string;
    referrer?: string;
}

/**
 * Umami's before-send hook, for page views and events alike: drops excluded
 * pages, keeps only KEPT_QUERY_PARAMETERS and no #hash, and cuts other
 * sites' referrers to their address without query. Returns null to send
 * nothing. `origin` is this site's, e.g. "https://communalists.com".
 */
export function sanitizeAnalyticsPayload<T extends Payload>(
    payload: T,
    origin: string
): T | null {
    let url: URL;
    try {
        url = new URL(payload.url ?? '', origin);
    } catch {
        return null;
    }
    if (url.origin !== origin || EXCLUDED_PATH.test(url.pathname)) return null;
    const result = { ...payload, url: cleanUrl(url).toString() };

    if (payload.referrer) {
        try {
            const from = new URL(payload.referrer, origin);
            if (from.origin === origin) {
                // Umami sends our own pages as a path.
                const clean = cleanUrl(from);
                result.referrer = EXCLUDED_PATH.test(from.pathname)
                    ? from.pathname
                    : clean.pathname + clean.search;
            } else {
                result.referrer = from.origin + from.pathname;
            }
        } catch {
            result.referrer = '';
        }
    }
    return result;
}
