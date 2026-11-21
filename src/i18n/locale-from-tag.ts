import { hasLocale } from 'next-intl';

import { routing, type Locale } from './routing';

/** "es" / "zh-CN" / "vi_VN" → a supported locale, or null. */
export function localeFromTag(tag: string | null | undefined): Locale | null {
    const base = tag?.split(/[-_]/)[0]?.toLowerCase();
    return base && hasLocale(routing.locales, base) ? base : null;
}
