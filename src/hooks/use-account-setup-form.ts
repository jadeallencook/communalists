'use client';

import { useActionState } from 'react';

import type { AccountSetupState } from '@/lib/validation/account-setup';

export type AccountSetupAction = (
    previous: AccountSetupState,
    formData: FormData
) => Promise<AccountSetupState>;

/**
 * Form state for account setup. Takes the action as an argument, so the app
 * passes the real server action and Storybook a mock.
 */
export function useAccountSetupForm(
    action: AccountSetupAction,
    initialState: AccountSetupState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    return { state, formAction, pending };
}
