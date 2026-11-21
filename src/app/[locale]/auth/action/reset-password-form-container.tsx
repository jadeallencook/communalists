'use client';

import { useLocale } from 'next-intl';

import { ResetPasswordForm } from '@/components/organisms/reset-password-form';
import { useResetPasswordForm } from '@/hooks/use-reset-password-form';

import { resetPassword } from './actions';

/** Connects the presentational ResetPasswordForm to the resetPassword action. */
export function ResetPasswordFormContainer({
    oobCode,
    email,
}: {
    oobCode: string;
    email: string;
}) {
    const locale = useLocale();
    const { state, formAction, pending } = useResetPasswordForm(resetPassword);

    return (
        <ResetPasswordForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            oobCode={oobCode}
            email={email}
        />
    );
}
