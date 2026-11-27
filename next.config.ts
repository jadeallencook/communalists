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
