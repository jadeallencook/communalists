import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Skeleton } from '@/components/atoms/skeleton';

export interface CreateOrganizationPageProps {
    /** The app passes a container wired to the action; Storybook passes <CreateOrganizationForm>. */
    form: ReactNode;
}

/** /org/new: title, short explanation, and the create form. */
export function CreateOrganizationPage({ form }: CreateOrganizationPageProps) {
    const t = useTranslations('Organizations');
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('new.title')}
                </h1>
                <p className="text-muted-foreground">{t('new.description')}</p>
            </header>
            {form}
        </section>
    );
}

/** Shown while the account is checked. */
export function CreateOrganizationPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-5 w-96 max-w-full" />
            </div>
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ))}
        </section>
    );
}
