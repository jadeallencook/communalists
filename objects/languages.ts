import { LanguageKeyTypes, LanguageTypes } from '@custom-types/languages';

const languages: { [key in LanguageKeyTypes]: LanguageTypes } = {
    english: 'English',
    espanol: 'Español',
    'tieng-viet': 'Tiếng Việt',
};

export default languages;
