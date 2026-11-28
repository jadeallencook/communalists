'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    AdminDefinitionUploadPage,
    type CheckDefinitionUpdateState,
    type SaveDefinitionUpdateState,
} from '@/components/pages/admin-definition-upload-page';

import {
    checkDefinitionUpdateAction,
    saveDefinitionUpdateAction,
} from './actions';

/** Wires the "Upload a definition" page to its two actions. */
export function DefinitionUploadContainer() {
    const locale = useLocale();
    const [check, checkAction, checkPending] = useActionState<
        CheckDefinitionUpdateState,
        FormData
    >(checkDefinitionUpdateAction, {});
    const [save, saveAction, savePending] = useActionState<
        SaveDefinitionUpdateState,
        FormData
    >(saveDefinitionUpdateAction, {});
    return (
        <AdminDefinitionUploadPage
            locale={locale}
            check={check}
            checkAction={checkAction}
            checkPending={checkPending}
            save={save}
            saveAction={saveAction}
            savePending={savePending}
        />
    );
}
