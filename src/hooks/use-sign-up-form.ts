'use client';

import { useActionState } from 'react';

import type {
    SignUpErrorKey,
    SignUpField,
    SignUpState,
} from '@/lib/validation/sign-up';

export type SignUpAction = (
    previous: SignUpState,
    formData: FormData
) => Promise<SignUpState>;

/**
 * Form state for creating an account. Takes the action as an argument, so the
 * same hook drives the real server action in the app and a mock in Storybook
 * and tests. Returns error *keys*; the UI decides how to word them.
 */
export function useSignUpForm(
    action: SignUpAction,
    initialState: SignUpState = {}
) {
    const [state, formAction, pending] = useActionState(action, initialState);
    const errorFor = (field: SignUpField): SignUpErrorKey | undefined =>
        state.fieldErrors?.[field];
    return { state, formAction, pending, errorFor };
}
