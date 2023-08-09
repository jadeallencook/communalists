import { LanguageKeyType, LanguageType } from '@custom-types/languages';

export const LANGUAGES: { [key in LanguageKeyType]: LanguageType } = {
    english: 'English',
    spanish: 'Español',
    vietnamese: 'Tiếng Việt',
    chinese: '中文',
};
