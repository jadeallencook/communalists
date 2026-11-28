import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    // Share cards (decision #72) read their fonts from these packages at
    // run time, so the files must ship with the card routes: only weight
    // 600 in .woff (about 5 MB), not the packages' other weights and woff2.
    outputFileTracingIncludes: {
        '/api/share-cards/**': [
            './node_modules/@fontsource/noto-sans/600.css',
            './node_modules/@fontsource/noto-sans/files/*-600-normal.woff',
            './node_modules/@fontsource/noto-sans-sc/600.css',
            './node_modules/@fontsource/noto-sans-sc/files/*-600-normal.woff',
        ],
    },
    outputFileTracingExcludes: {
        '/api/share-cards/**': [
            './node_modules/@fontsource/*/files/*.woff2',
            './node_modules/@fontsource/*/files/*-{100,200,300,400,500,700,800,900}-*',
            './node_modules/@fontsource/*/files/*-italic.woff',
        ],
    },
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
