'use client';

import { useLocale } from 'next-intl';

import { SignInForm } from '@/components/organisms/sign-in-form';
import { useSignInForm } from '@/hooks/use-sign-in-form';

import { signIn } from './actions';

/** Connects the presentational SignInForm to the signIn server action. */
export function SignInFormContainer({ next }: { next?: string }) {
    const locale = useLocale();
    const { state, formAction, pending } = useSignInForm(signIn);

    return (
        <SignInForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            next={next}
        />
    );
}
