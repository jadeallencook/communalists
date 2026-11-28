import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    DefinitionUpload,
    type DefinitionUploadProps,
} from '@/components/organisms/definition-upload';
import { Link } from '@/i18n/navigation';

export type {
    CheckDefinitionUpdateState,
    SaveDefinitionUpdateState,
} from '@/components/organisms/definition-upload';

export type AdminDefinitionUploadPageProps = Omit<
    DefinitionUploadProps,
    'slug'
>;

/**
 * /admin/definitions/upload, for super users: upload one word's file, see
 * each field that changes (now and new), then update it. Related words are
 * never changed. No logic: it renders the states.
 */
export function AdminDefinitionUploadPage(
    props: AdminDefinitionUploadPageProps
) {
    const t = useTranslations('AdminDefinitions');
    const tu = useTranslations('AdminDefinitions.upload');
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin/definitions"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('backToList')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {tu('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {tu('intro')}
                </p>
            </header>

            <section
                aria-labelledby="upload-format"
                className="flex flex-col gap-2"
            >
                <h2
                    id="upload-format"
                    className="font-heading text-xl font-semibold"
                >
                    {tu('formatTitle')}
                </h2>
                <ul className="ml-5 list-disc text-sm text-pretty">
                    <li>{tu('formatOneRow')}</li>
                    <li>{tu('formatSlug')}</li>
                    <li>{tu('formatRelated')}</li>
                </ul>
            </section>

            <DefinitionUpload {...props} />
        </section>
    );
}
