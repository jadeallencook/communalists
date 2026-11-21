import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'es', 'vi', 'zh'],
    defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

/** Each locale's name in its own language, for the language switcher. */
export const localeNames: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
    vi: 'Tiếng Việt',
    zh: '中文',
};
