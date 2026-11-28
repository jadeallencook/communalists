import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    // Shown in the footer (src/lib/build-info.ts). VERCEL_GIT_COMMIT_SHA is
    // set on Vercel builds only.
    env: {
        NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    },
    // /welcome became /dashboard (decision #20); keep old links working.
    async redirects() {
        return [
            {
                source: '/:locale(en|es|vi|zh)/welcome',
                destination: '/:locale/dashboard',
                permanent: true,
            },
            // The dictionary moved from /define to /dictionary (decision #57);
            // shared word links keep working.
            {
                source: '/:locale(en|es|vi|zh)/define/:slug',
                destination: '/:locale/dictionary/:slug',
                permanent: true,
            },
            {
                source: '/:locale(en|es|vi|zh)/define',
                destination: '/:locale/dictionary',
                permanent: true,
            },
            {
                source: '/define/:slug',
                destination: '/dictionary/:slug',
                permanent: true,
            },
            { source: '/define', destination: '/dictionary', permanent: true },
            // Organizations moved from /org to /organization, and /find
            // became /find/{kind} (decision #63). Shared and printed links
            // keep working, so these stay. Next keeps the query string.
            {
                source: '/:locale(en|es|vi|zh)/org/:path*',
                destination: '/:locale/organization/:path*',
                permanent: true,
            },
            {
                source: '/org/:path*',
                destination: '/organization/:path*',
                permanent: true,
            },
            // An old search: the country code (two letters) right after
            // /find. No kind is two letters, so the two can't be confused.
            {
                source: '/:locale(en|es|vi|zh)/find/:country([a-zA-Z]{2})/:path*',
                destination: '/:locale/find/organizations/:country/:path*',
                permanent: true,
            },
            {
                source: '/find/:country([a-zA-Z]{2})/:path*',
                destination: '/find/organizations/:country/:path*',
                permanent: true,
            },
            // Plain /find searches organizations, the only kind so far. Not
            // permanent: it may become a page for choosing what to find.
            {
                source: '/:locale(en|es|vi|zh)/find',
                destination: '/:locale/find/organizations',
                permanent: false,
            },
            {
                source: '/find',
                destination: '/find/organizations',
                permanent: false,
            },
            // The list starts at A. Not permanent, in case that changes.
            {
                source: '/:locale(en|es|vi|zh)/dictionary',
                destination: '/:locale/dictionary/a',
                permanent: false,
            },
        ];
    },
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
};

// Points next-intl at src/i18n/request.ts.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
