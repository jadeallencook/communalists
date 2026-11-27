import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { statWindows } from '@/lib/platform-stats';

import { UMAMI_WEBSITE_ID } from './index';
import {
    parseMetricRows,
    parseSiteStats,
    topCities,
    topOrganizations,
    type Ranked,
    type SiteStats,
} from './reports';

// Umami Cloud's API, read on the server for the super-user dashboard
// (documentation/technical/analytics.md → "Reports on /admin").
//
// UMAMI_API_KEY is set on Vercel Production only, marked sensitive. The key
// can do almost anything in the Umami account, not just read, so it never
// leaves the server: no NEXT_PUBLIC_, never logged, never sent to the page.
// Umami allows 50 calls per 15 seconds per key; one report is 2 calls,
// cached for an hour.

const API = 'https://api.umami.is/v1';
/** Cleared by nothing in the app: Umami data changes on its own. */
export const UMAMI_TAG = 'umami';

export type UmamiReport =
    | { status: 'notConfigured' }
    | { status: 'error' }
    | {
          status: 'ok';
          /** When it was fetched (epoch ms). */
          at: number;
          stats: SiteStats;
          organizations: Ranked[];
          cities: Ranked[];
      };

async function get(path: string, key: string, params: Record<string, string>) {
    const url = `${API}/websites/${UMAMI_WEBSITE_ID}/${path}?${new URLSearchParams(params)}`;
    const response = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${key}` },
        // Umami's 30-day metrics took over 8 s from Vercel on 2026-11-27.
        signal: AbortSignal.timeout(20_000),
        cache: 'no-store',
    });
    // Status only: the URL has no secrets, but keep logs plain.
    if (!response.ok) throw new Error(`umami ${path} ${response.status}`);
    return response.json();
}

const apiKey = () => process.env.UMAMI_API_KEY?.trim();

/**
 * Throws on any failure, so a failed fetch isn't cached for an hour. Reads
 * the key itself rather than taking it as an argument, because arguments
 * become part of the cache key.
 */
async function fetchReport() {
    'use cache';
    cacheTag(UMAMI_TAG);
    cacheLife('hours');
    const key = apiKey();
    if (!key) throw new Error('umami: no key');
    const now = Date.now();
    const { last30 } = statWindows(now);
    const range = { startAt: String(last30.start), endAt: String(last30.end) };
    const [statsJson, pathsJson] = await Promise.all([
        get('stats', key, range),
        get('metrics', key, { ...range, type: 'path', limit: '1000' }),
    ]);
    const stats = parseSiteStats(statsJson);
    const rows = parseMetricRows(pathsJson);
    if (!stats || !rows) throw new Error('umami: unexpected response shape');
    return {
        at: now,
        stats,
        organizations: topOrganizations(rows),
        cities: topCities(rows),
    };
}

/** The last 30 days from Umami, or why there's nothing to show. */
export async function getUmamiReport(): Promise<UmamiReport> {
    if (!apiKey()) return { status: 'notConfigured' };
    try {
        return { status: 'ok', ...(await fetchReport()) };
    } catch (error) {
        console.error('[umami] report failed:', (error as Error).message);
        return { status: 'error' };
    }
}
