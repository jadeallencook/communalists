import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    ResetPasswordPage,
    ResetPasswordPageLoading,
} from '@/components/pages/reset-password-page';
import { IdentityToolkitError } from '@/lib/auth/identity-toolkit';
import { verifyPasswordResetCode } from '@/lib/auth/password-reset';
import { linkProblemFor } from '@/lib/validation/reset-password';

import { ResetPasswordFormContainer } from './reset-password-form-container';

// The Action URL set in Firebase Authentication → Templates. Every Firebase
// auth email links here with ?mode=…&oobCode=…&lang=… (src/proxy.ts uses
// `lang` to pick the locale). Only `resetPassword` is handled so far.

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('ResetPassword');
    return {
        title: t('metaTitle'),
        robots: { index: false, follow: false },
        // The URL holds a one-time code; never send it to another site.
        referrer: 'no-referrer',
    };
}

// The search params are per request, so the content streams behind <Suspense>.
export default function Page({
    searchParams,
}: PageProps<'/[locale]/auth/action'>) {
    return (
        <Suspense fallback={<ResetPasswordPageLoading />}>
            <AuthActionContainer searchParams={searchParams} />
        </Suspense>
    );
}

async function AuthActionContainer({
    searchParams,
}: Pick<PageProps<'/[locale]/auth/action'>, 'searchParams'>) {
    const params = await searchParams;
    const mode = typeof params.mode === 'string' ? params.mode : '';
    const oobCode = typeof params.oobCode === 'string' ? params.oobCode : '';

    if (mode !== 'resetPassword' || !oobCode) {
        return <ResetPasswordPage problem="invalid" />;
    }

    let email: string;
    try {
        email = await verifyPasswordResetCode(oobCode);
    } catch (error) {
        const code =
            error instanceof IdentityToolkitError ? error.code : 'unknown';
        const problem = linkProblemFor(code);
        if (problem === 'generic') {
            console.error('[auth-action] verify failed', code);
        }
        return (
            <ResetPasswordPage
                problem={problem === 'generic' ? 'expired' : problem}
            />
        );
    }

    return (
        <ResetPasswordPage
            email={email}
            form={
                <ResetPasswordFormContainer oobCode={oobCode} email={email} />
            }
        />
    );
}
