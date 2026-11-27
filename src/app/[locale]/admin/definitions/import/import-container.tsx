'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    AdminDefinitionsImportPage,
    type AddDefinitionsState,
    type CheckDefinitionsState,
} from '@/components/pages/admin-definitions-import-page';

import { addDefinitionsAction, checkDefinitionsAction } from './actions';

/** Wires the dictionary import page to its two actions. */
export function DefinitionsImportContainer({
    templateHref,
}: {
    templateHref: string;
}) {
    const locale = useLocale();
    const [check, checkAction, checkPending] = useActionState<
        CheckDefinitionsState,
        FormData
    >(checkDefinitionsAction, {});
    const [add, addAction, addPending] = useActionState<
        AddDefinitionsState,
        FormData
    >(addDefinitionsAction, {});
    return (
        <AdminDefinitionsImportPage
            locale={locale}
            templateHref={templateHref}
            check={check}
            checkAction={checkAction}
            checkPending={checkPending}
            add={add}
            addAction={addAction}
            addPending={addPending}
        />
    );
}
