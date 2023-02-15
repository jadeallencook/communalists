import { LanguageKeyTypes } from '@custom-types/languages';
import shared from './shared';
import requestAidForm from './request-aid-form';
import footer from './footer';

export type ComponentType = 'shared' | 'request-aid-form' | 'footer';

export interface SnippetInterface {
    [key: string]: {
        [key in LanguageKeyTypes]: string;
    };
}

const snippets: {
    [key in ComponentType]: SnippetInterface;
} = {
    shared,
    'request-aid-form': requestAidForm,
    footer,
};

export default snippets;
