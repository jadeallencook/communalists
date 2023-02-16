import { LanguageKeyTypes, LanguageTypes } from '@custom-types/languages';

const languages: { [key in LanguageKeyTypes]: LanguageTypes } = {
    english: 'English',
    spanish: 'Español',
    vietnamese: 'Tiếng Việt',
    chinese: '中文',
};

export default languages;
