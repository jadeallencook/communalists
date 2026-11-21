import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { routing } from './routing';

// Reads the locale from the `[locale]` root segment via `next/root-params`,
// which works with Cache Components (no `setRequestLocale` needed).
export default getRequestConfig(async ({ locale }) => {
    const requested = locale ?? (await rootLocale());
    const resolved = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    return {
        locale: resolved,
        messages: (await import(`../../messages/${resolved}.json`)).default,
        timeZone: 'America/Los_Angeles',
    };
});
