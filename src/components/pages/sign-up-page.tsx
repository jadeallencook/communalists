import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthCard } from '@/components/organisms/auth-card';

export interface SignUpPageProps {
    /** The form. The app passes a container wired to the server action; Storybook passes <SignUpForm> with mock state. */
    form: ReactNode;
    /** Where to go afterward; kept on the link to the other page. */
    next?: string;
}

/** Create-account page: the form in an AuthCard, with a link to sign in. */
export function SignUpPage({ form, next }: SignUpPageProps) {
    const t = useTranslations('SignUp');

    return (
        <AuthCard
            title={t('title')}
            description={t('description')}
            footer={{
                prompt: t('haveAccount'),
                label: t('signIn'),
                href: next
                    ? `/sign-in?next=${encodeURIComponent(next)}`
                    : '/sign-in',
            }}
        >
            {form}
        </AuthCard>
    );
}
