'use client';

import { useLocale } from 'next-intl';

import { SignUpForm } from '@/components/organisms/sign-up-form';
import { useSignUpForm } from '@/hooks/use-sign-up-form';

import { signUp } from './actions';

/** Connects the presentational SignUpForm to the signUp server action. */
export function SignUpFormContainer() {
    const locale = useLocale();
    const { state, formAction, pending } = useSignUpForm(signUp);
    return (
        <SignUpForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
        />
    );
}
