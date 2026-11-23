import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export interface AccountSettingsPageProps {
    /** The account's email (sign-in only; changing it isn't built yet). */
    email?: string;
    /** The profile form. The app passes a container; Storybook passes <AccountSetupForm mode="settings">. */
    form: ReactNode;
}

/** Edit name, preferred language and city. */
export function AccountSettingsPage({ email, form }: AccountSettingsPageProps) {
    const t = useTranslations('AccountSettings');
    return (
        <section className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </header>

            {email && (
                <div className="flex flex-col gap-1 rounded-lg border p-4 text-sm">
                    <span className="font-medium">{t('email')}</span>
                    <span className="break-all text-muted-foreground">
                        {email}
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <h2 className="font-heading text-xl font-semibold">
                    {t('profileTitle')}
                </h2>
                {form}
            </div>
        </section>
    );
}

/** Placeholder while the account loads. */
export function AccountSettingsPageLoading() {
    const t = useTranslations('AccountSettings');
    return (
        <section className="mx-auto w-full max-w-xl px-4 py-12">
            <p role="status" className="text-muted-foreground">
                {t('loading')}
            </p>
        </section>
    );
}
