// Canonical URLs. Production is communalists.com (decision #10); previews use
// their own Vercel URL so links in preview deployments point at the preview.
export const PRODUCTION_URL = 'https://communalists.com';
export const STORYBOOK_URL = 'https://storybook.communalists.com';

export function getSiteUrl(): string {
    if (process.env.VERCEL_ENV === 'production') return PRODUCTION_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}
