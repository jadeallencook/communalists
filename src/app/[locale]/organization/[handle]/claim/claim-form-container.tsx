'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    ClaimOrganizationForm,
    type ClaimFormState,
} from '@/components/organisms/claim-organization-form';

import { submitClaimAction } from './actions';

/** Wires the claim form to submitClaimAction. */
export function ClaimFormContainer({
    name,
    orgId,
    handle,
}: {
    name: string;
    orgId: string;
    handle: string;
}) {
    const locale = useLocale();
    const [state, formAction, pending] = useActionState<
        ClaimFormState,
        FormData
    >(submitClaimAction, {});
    return (
        <ClaimOrganizationForm
            name={name}
            orgId={orgId}
            handle={handle}
            locale={locale}
            state={state}
            formAction={formAction}
            pending={pending}
        />
    );
}
