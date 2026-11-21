'use client';

import { useLocale } from 'next-intl';

import { ForgotPasswordForm } from '@/components/organisms/forgot-password-form';
import { useForgotPasswordForm } from '@/hooks/use-forgot-password-form';

import { requestPasswordReset } from './actions';

/** Connects the presentational ForgotPasswordForm to the requestPasswordReset action. */
export function ForgotPasswordFormContainer() {
    const locale = useLocale();
    const { state, formAction, pending } =
        useForgotPasswordForm(requestPasswordReset);

    return (
        <ForgotPasswordForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
        />
    );
}
