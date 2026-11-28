import { hasLocale } from 'next-intl';
import type { NextRequest } from 'next/server';

import { previewsFor } from '@/lib/definitions';
import { getDefinitions } from '@/lib/definitions/store';
import { routing } from '@/i18n/routing';

// GET /api/definitions?locale=es → { [slug]: { word, definition, lang } }: the
// short definitions for words marked on our pages (<Definition>, features/19).
// Public, like /dictionary. Served from the cached word list (no read per
// request), and the CDN keeps a copy for 5 minutes, so an edit can take that
// long to reach the tooltips.
export async function GET(request: NextRequest) {
    const requested = request.nextUrl.searchParams.get('locale') ?? '';
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    return Response.json(previewsFor(await getDefinitions(), locale), {
        headers: {
            'cache-control':
                'public, s-maxage=300, stale-while-revalidate=3600',
        },
    });
}
