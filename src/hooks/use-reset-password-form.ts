'use client';

import { useActionState } from 'react';

import type { ResetPasswordState } from '@/lib/validation/reset-password';

export type ResetPasswordAction = (
    previous: ResetPasswordState,
    formData: FormData
) => Promise<ResetPasswordState>;

/**
 * Form state for choosing a new password from an emailed link. Takes the
 * action as an argument, so the app passes the real server action and
 * Storybook a mock.
 */
export function useResetPasswordForm(
    action: ResetPasswordAction,
    initialState: ResetPasswordState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    return { state, formAction, pending };
}
