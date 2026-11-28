import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site';

// /robots.txt (documentation/technical/seo.md). Only production is indexed;
// previews and local builds ask crawlers to stay out entirely. Signed-in
// areas redirect signed-out visitors anyway; listing them saves crawl time.
export default function robots(): MetadataRoute.Robots {
    if (process.env.VERCEL_ENV !== 'production')
        return { rules: { userAgent: '*', disallow: '/' } };
    return {
        rules: {
            userAgent: '*',
            // Share cards are link-preview images (decision #72): preview
            // crawlers that honour robots.txt (Twitterbot, Slackbot) must be
            // able to fetch them. The longer path wins over `/api/`.
            allow: ['/', '/api/share-cards/'],
            disallow: [
                '/api/',
                '/*/account/',
                '/*/admin',
                '/*/dashboard',
                '/*/auth/',
            ],
        },
        sitemap: `${getSiteUrl()}/sitemap.xml`,
    };
}
