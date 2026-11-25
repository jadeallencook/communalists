import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';

export interface EditOrganizationPageProps {
    name: string;
    handle: string;
    /** The app passes a container wired to the action; Storybook passes <CreateOrganizationForm mode="edit">. */
    form: ReactNode;
    /** Owners only: the delete section (DeleteOrganizationSection, wired by a container). */
    deleteSection?: ReactNode;
}

/** /org/{handle}/edit: back to the group, a title, and the form filled in. */
export function EditOrganizationPage({
    name,
    handle,
    form,
    deleteSection,
}: EditOrganizationPageProps) {
    const t = useTranslations('Organizations');
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="self-start"
                >
                    <Link href={`/org/${handle}`}>
                        <ArrowLeftIcon aria-hidden />
                        {name}
                    </Link>
                </Button>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('edit.title')}
                </h1>
                <p className="text-muted-foreground">{t('edit.description')}</p>
            </header>
            {form}
            {deleteSection}
        </section>
    );
}

/** Shown while the organization loads. */
export function EditOrganizationPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-9 w-64" />
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
