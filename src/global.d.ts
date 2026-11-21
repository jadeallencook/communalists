import type messages from '../messages/en.json';
import type { routing } from './i18n/routing';

// Type-checks every `t('…')` call against the English messages and
// restricts locales to the configured list.
declare module 'next-intl' {
    interface AppConfig {
        Locale: (typeof routing.locales)[number];
        Messages: typeof messages;
    }
}
