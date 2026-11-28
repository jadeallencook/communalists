'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    DefinitionUpload,
    type CheckDefinitionUpdateState,
    type SaveDefinitionUpdateState,
} from '@/components/organisms/definition-upload';
import { AdminDefinitionUploadPage } from '@/components/pages/admin-definition-upload-page';

import {
    checkDefinitionUpdateAction,
    saveDefinitionUpdateAction,
} from './actions';

/** The check and save actions, wired once for both places the upload is used. */
function useDefinitionUpload() {
    const locale = useLocale();
    const [check, checkAction, checkPending] = useActionState<
        CheckDefinitionUpdateState,
        FormData
    >(checkDefinitionUpdateAction, {});
    const [save, saveAction, savePending] = useActionState<
        SaveDefinitionUpdateState,
        FormData
    >(saveDefinitionUpdateAction, {});
    return {
        locale,
        check,
        checkAction,
        checkPending,
        save,
        saveAction,
        savePending,
    };
}

/** Wires the "Upload a definition" page to its two actions. */
export function DefinitionUploadContainer() {
    return <AdminDefinitionUploadPage {...useDefinitionUpload()} />;
}

/** The same upload on a word's edit page, accepting only that word's file. */
export function WordUploadContainer({ slug }: { slug: string }) {
    return (
        <DefinitionUpload
            {...useDefinitionUpload()}
            slug={slug}
            headingLevel={3}
        />
    );
}
