'use client';

import { useActionState } from 'react';

import type { CreateOrganizationState } from '@/lib/validation/organization';

export type CreateOrganizationAction = (
    previous: CreateOrganizationState,
    formData: FormData
) => Promise<CreateOrganizationState>;

/** Form state for creating an organization; the app passes the server action, Storybook a mock. */
export function useCreateOrganizationForm(
    action: CreateOrganizationAction,
    initialState: CreateOrganizationState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    return { state, formAction, pending };
}
