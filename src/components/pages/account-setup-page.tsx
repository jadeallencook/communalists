import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthCard } from '@/components/organisms/auth-card';

export interface AccountSetupPageProps {
    /** The app passes a container wired to the server action; Storybook passes <AccountSetupForm>. */
    form: ReactNode;
    /** `new`: straight from sign-up. `returning`: an existing account missing answers (prototype users, new required questions). */
    variant?: 'new' | 'returning';
}

/** Where every account answers what it needs before it can be used. */
export function AccountSetupPage({
    form,
    variant = 'new',
}: AccountSetupPageProps) {
    const t = useTranslations('AccountSetup');
    return (
        <AuthCard
            title={t(`${variant}.title`)}
            description={t(`${variant}.description`)}
        >
            {form}
        </AuthCard>
    );
}

/** Placeholder while the profile loads. */
export function AccountSetupPageLoading() {
    const t = useTranslations('AccountSetup');
    return (
        <AuthCard title={t('new.title')}>
            <p role="status" className="text-sm text-muted-foreground">
                {t('loading')}
            </p>
        </AuthCard>
    );
}
