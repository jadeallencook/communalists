import { LanguageKeyTypes, LanguageTypes } from '@custom-types/languages';

const languages: { [key in LanguageKeyTypes]: LanguageTypes } = {
	english: 'English',
	espanol: 'Español',
	'tieng-viet': 'Tieng Viet',
};

export default languages;
