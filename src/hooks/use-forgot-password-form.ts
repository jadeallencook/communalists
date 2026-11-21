'use client';

import { useActionState } from 'react';

import type { ForgotPasswordState } from '@/lib/validation/forgot-password';

export type ForgotPasswordAction = (
    previous: ForgotPasswordState,
    formData: FormData
) => Promise<ForgotPasswordState>;

/**
 * Form state for requesting a password-reset email. Takes the action as an
 * argument, so the app passes the real server action and Storybook a mock.
 */
export function useForgotPasswordForm(
    action: ForgotPasswordAction,
    initialState: ForgotPasswordState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    return { state, formAction, pending };
}
