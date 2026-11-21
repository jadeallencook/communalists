import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { localeFromTag } from './i18n/locale-from-tag';
import { routing } from './i18n/routing';

// Redirects locale-less URLs (e.g. `/`) to a locale prefix based on the
// locale cookie or `Accept-Language`, and remembers the choice in a cookie.
const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    // Firebase auth emails all link to one Action URL, /auth/action, with the
    // email's language in `lang`. Use that language, not the browser's.
    const { pathname, searchParams } = request.nextUrl;
    if (pathname === '/auth/action') {
        const locale = localeFromTag(searchParams.get('lang'));
        if (locale) {
            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/auth/action`;
            return NextResponse.redirect(url);
        }
    }
    return intl(request);
}

export const config = {
    // Skip API routes, Next.js internals, Vercel internals, and files with an
    // extension (favicon.ico, images, etc.).
    matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
