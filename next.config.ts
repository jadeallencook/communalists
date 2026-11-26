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
