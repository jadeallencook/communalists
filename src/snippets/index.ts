import { LanguageKeyType } from '@custom-types/languages';
import shared from './shared';
import requestAidForm from './request-aid-form';
import footer from './footer';
import signUpForm from './sign-up-form';
import navigation from './navigation';
import logInForm from './login-form';
import donateForm from './donate';

export type ComponentType =
    | 'shared'
    | 'request-aid-form'
    | 'footer'
    | 'sign-up-form'
    | 'navigation'
    | 'log-in-form'
    | 'donate-form';

export interface SnippetInterface {
    [key: string]: {
        [key in LanguageKeyType]: string;
    };
}

const snippets: {
    [key in ComponentType]: SnippetInterface;
} = {
    shared,
    'request-aid-form': requestAidForm,
    footer,
    'sign-up-form': signUpForm,
    navigation,
    'log-in-form': logInForm,
    'donate-form': donateForm,
};

export default snippets;
