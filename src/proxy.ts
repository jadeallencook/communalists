import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Redirects locale-less URLs (e.g. `/`) to a locale prefix based on the
// locale cookie or `Accept-Language`, and remembers the choice in a cookie.
export default createMiddleware(routing);

export const config = {
    // Skip API routes, Next.js internals, Vercel internals, and files with an
    // extension (favicon.ico, images, etc.).
    matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
