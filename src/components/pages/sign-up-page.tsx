import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthCard } from '@/components/organisms/auth-card';

export interface SignUpPageProps {
    /** The form. The app passes a container wired to the server action; Storybook passes <SignUpForm> with mock state. */
    form: ReactNode;
}

/** Create-account page: the form in an AuthCard, with a link to sign in. */
export function SignUpPage({ form }: SignUpPageProps) {
    const t = useTranslations('SignUp');

    return (
        <AuthCard
            title={t('title')}
            description={t('description')}
            footer={{
                prompt: t('haveAccount'),
                label: t('signIn'),
                href: '/sign-in',
            }}
        >
            {form}
        </AuthCard>
    );
}
