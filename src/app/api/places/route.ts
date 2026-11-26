import { NextResponse, type NextRequest } from 'next/server';

import { searchPlaces } from '@/lib/places';
import { isSupportedCountry, type PlaceOption } from '@/lib/places/types';

// GET /api/places?country=US&q=san+jo → { results: [{ id, label, slug }] }
// Public and static data, so responses are cached by browsers and Vercel's CDN.
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const country = searchParams.get('country') ?? 'US';
    const query = (searchParams.get('q') ?? '').slice(0, 100);

    if (!isSupportedCountry(country)) {
        return NextResponse.json(
            { error: 'Unsupported country' },
            { status: 400 }
        );
    }

    const results: PlaceOption[] = searchPlaces(country, query).map(
        ({ id, label, slug }) => ({ id, label, slug })
    );
    return NextResponse.json(
        { results },
        {
            headers: {
                'Cache-Control':
                    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            },
        }
    );
}
