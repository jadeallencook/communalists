// Reading Umami's reports for the super-user dashboard. Pure: no React, Next
// or fetch. The API calls are in ./umami-store.ts. Design:
// documentation/technical/analytics.md → "Reports on /admin".
//
// Umami's metrics endpoint returns [{ x, y }]: a dimension value (here a page
// path) and its count. Paths keep their locale prefix (/es/org/sbma), so the
// same page in four languages is four rows; these helpers add them up.

import { z } from 'zod';

const metricRows = z.array(
    z.object({ x: z.string().nullable(), y: z.coerce.number() })
);

export type MetricRow = z.infer<typeof metricRows>[number];

/** Umami's metrics response, or null when it isn't the expected shape. */
export function parseMetricRows(json: unknown): MetricRow[] | null {
    const parsed = metricRows.safeParse(json);
    return parsed.success ? parsed.data : null;
}

// A stat is a number in current Umami, and was { value } in older versions.
const stat = z.union([
    z.coerce.number(),
    z.object({ value: z.coerce.number() }).transform((s) => s.value),
]);
const stats = z.object({
    pageviews: stat,
    visitors: stat,
    comparison: z
        .object({ pageviews: stat, visitors: stat })
        .partial()
        .optional(),
});

export interface SiteStats {
    visitors: number;
    pageviews: number;
    /** The period before, when Umami sends it. */
    previous?: { visitors?: number; pageviews?: number };
}

/** Umami's stats response, or null when it isn't the expected shape. */
export function parseSiteStats(json: unknown): SiteStats | null {
    const parsed = stats.safeParse(json);
    if (!parsed.success) return null;
    const { visitors, pageviews, comparison } = parsed.data;
    return {
        visitors,
        pageviews,
        ...(comparison ? { previous: comparison } : {}),
    };
}

const LOCALE = '(?:/(?:en|es|vi|zh))?';
/** An organization's own page: /org/{handle}, not its edit or claim pages. */
const ORG_PAGE = new RegExp(`^${LOCALE}/org/([a-z0-9-]+)/?$`);
/** A /find search: /find/{country}/{region}/{city}. */
const FIND_PAGE = new RegExp(`^${LOCALE}/find/([a-z]{2})/([^/]+)/([^/]+)/?$`);

export interface Ranked {
    key: string;
    views: number;
}

function rank(
    rows: MetricRow[],
    keyOf: (path: string) => string | null,
    limit: number
): Ranked[] {
    const totals = new Map<string, number>();
    for (const { x, y } of rows) {
        const key = x ? keyOf(x.toLowerCase()) : null;
        if (key) totals.set(key, (totals.get(key) ?? 0) + y);
    }
    return [...totals]
        .map(([key, views]) => ({ key, views }))
        .sort((a, b) => b.views - a.views || a.key.localeCompare(b.key))
        .slice(0, limit);
}

/** The most-viewed organization pages, by handle, all languages added up. */
export function topOrganizations(rows: MetricRow[], limit = 10): Ranked[] {
    return rank(rows, (path) => ORG_PAGE.exec(path)?.[1] ?? null, limit);
}

/**
 * The most-searched cities, by their /find path ("us/ca/oakland"). Each
 * filter change is a page view too, so this counts searches shown, not
 * people.
 */
export function topCities(rows: MetricRow[], limit = 10): Ranked[] {
    return rank(
        rows,
        (path) => {
            const match = FIND_PAGE.exec(path);
            return match
                ? `${match[1]}/${decodeURIComponent(match[2])}/${decodeURIComponent(match[3])}`
                : null;
        },
        limit
    );
}

/** Fewer local organizations than this and a searched city needs research. */
export const FEW_RESULTS = 3;
