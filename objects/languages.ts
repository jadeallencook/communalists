import { LanguageKeyType, LanguageType } from '@custom-types/languages';

const languages: { [key in LanguageKeyType]: LanguageType } = {
    english: 'English',
    espanol: 'Español',
    'tieng-viet': 'Tiếng Việt',
};

export default languages;
