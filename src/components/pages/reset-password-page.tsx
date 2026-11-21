import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { LinkProblem } from '@/components/molecules/link-problem';
import { AuthCard } from '@/components/organisms/auth-card';
import type { LinkProblem as Reason } from '@/lib/validation/reset-password';

export interface ResetPasswordPageProps {
    /** Why the link can't be used. When set, shown instead of the form. */
    problem?: Reason;
    /** The account the link is for. */
    email?: string;
    /** The app passes a container wired to the server action; Storybook passes <ResetPasswordForm>. */
    form?: ReactNode;
}

/** Where emailed reset links land: choose a new password, or why the link can't be used. */
export function ResetPasswordPage({
    problem,
    email = '',
    form,
}: ResetPasswordPageProps) {
    const t = useTranslations('ResetPassword');

    if (problem) {
        return (
            <AuthCard
                title={t('problemTitle')}
                footer={{
                    prompt: t('remembered'),
                    label: t('signIn'),
                    href: '/sign-in',
                }}
            >
                <LinkProblem reason={problem} />
            </AuthCard>
        );
    }

    return (
        <AuthCard title={t('title')} description={t('description', { email })}>
            {form}
        </AuthCard>
    );
}

/** Placeholder while the link is checked. */
export function ResetPasswordPageLoading() {
    const t = useTranslations('ResetPassword');
    return (
        <AuthCard title={t('title')}>
            <p role="status" className="text-sm text-muted-foreground">
                {t('checking')}
            </p>
        </AuthCard>
    );
}
