import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AuthCard } from '@/components/organisms/auth-card';

export interface SignInPageProps {
    /** The form. The app passes a container wired to the server action; Storybook passes <SignInForm> with mock state. */
    form: ReactNode;
    /** Where to go afterward; kept on the link to the other page. */
    next?: string;
}

/** Sign-in page: the form in an AuthCard, with a link to create an account. */
export function SignInPage({ form, next }: SignInPageProps) {
    const t = useTranslations('SignIn');

    return (
        <AuthCard
            title={t('title')}
            description={t('description')}
            footer={{
                prompt: t('noAccount'),
                label: t('createAccount'),
                href: next
                    ? `/sign-up?next=${encodeURIComponent(next)}`
                    : '/sign-up',
            }}
        >
            {form}
        </AuthCard>
    );
}
