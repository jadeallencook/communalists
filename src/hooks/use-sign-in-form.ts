'use client';

import { useActionState } from 'react';

import type { SignInState } from '@/lib/validation/sign-in';

export type SignInAction = (
    previous: SignInState,
    formData: FormData
) => Promise<SignInState>;

/**
 * Form state for signing in. Takes the action as an argument, so the app
 * passes the real server action and Storybook passes a mock. Returns error
 * *keys*; the UI decides how to word them.
 */
export function useSignInForm(
    action: SignInAction,
    initialState: SignInState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    return { state, formAction, pending };
}
