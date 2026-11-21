import { readFileSync } from 'node:fs';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as {
    version: string;
};

const nextConfig: NextConfig = {
    // Shown in the footer (src/lib/build-info.ts). VERCEL_GIT_COMMIT_SHA is
    // set on Vercel builds only.
    env: {
        NEXT_PUBLIC_APP_VERSION: version,
        NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
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
