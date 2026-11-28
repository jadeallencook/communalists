'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import { DeleteOrganizationSection } from '@/components/organisms/delete-organization-section';
import { deleteConfirmed } from '@/lib/organizations/lifecycle';

import {
    deleteOrganizationAction,
    type DeleteOrganizationState,
} from './actions';

/** Wires the delete section: the typed name, the confirmation rule, and the action. */
export function DeleteOrganizationContainer({
    name,
    orgId,
}: {
    name: string;
    orgId: string;
}) {
    const locale = useLocale();
    const t = useTranslations('Organizations.delete');
    const [typed, setTyped] = useState('');
    const [result, formAction, pending] = useActionState<
        DeleteOrganizationState,
        FormData
    >(deleteOrganizationAction, {});
    return (
        <DeleteOrganizationSection
            name={name}
            orgId={orgId}
            locale={locale}
            typed={typed}
            onTypedChange={setTyped}
            confirmed={deleteConfirmed(typed, name)}
            formAction={formAction}
            pending={pending}
            error={result.error ? t(`errors.${result.error}`) : undefined}
        />
    );
}
