import { LanguageKeyType, LanguageType } from '@custom-types/languages';

const languages: { [key in LanguageKeyType]: LanguageType } = {
    english: 'English',
    spanish: 'Español',
    vietnamese: 'Tiếng Việt',
    chinese: '中文',
};

export default languages;
