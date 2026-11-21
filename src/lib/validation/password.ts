import { z } from 'zod';

// Rules for choosing a password, shared by sign-up and reset-password.
// Messages are translation keys; each form's namespace defines them.

/** Not trimmed: spaces are valid password characters. */
export const newPasswordField = z
    .string({ error: 'required' })
    .min(8, { error: 'passwordTooShort' })
    .max(128, { error: 'passwordTooLong' });

/** The password typed a second time. Compared, never stored. */
export const confirmPasswordField = z
    .string({ error: 'required' })
    .min(1, { error: 'required' });

type PasswordPair = { password: string; confirmPassword: string };

/** Use as `.refine(...passwordsMatch)` on an object with password + confirmPassword. */
export const passwordsMatch: [
    (input: PasswordPair) => boolean,
    {
        error: string;
        path: PropertyKey[];
        when: (payload: { issues: { path?: PropertyKey[] }[] }) => boolean;
    },
] = [
    (input: PasswordPair) => input.password === input.confirmPassword,
    {
        error: 'passwordMismatch',
        path: ['confirmPassword'],
        // Zod skips object checks once any field fails. Run this one anyway,
        // unless a password field already has its own error.
        when: ({ issues }: { issues: { path?: PropertyKey[] }[] }) =>
            !issues.some((issue) =>
                ['password', 'confirmPassword'].includes(
                    String(issue.path?.[0])
                )
            ),
    },
];
