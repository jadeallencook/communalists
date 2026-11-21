import 'server-only';

import { callIdentityToolkit } from './identity-toolkit';

/**
 * Has Firebase email a password-reset link. The email uses Firebase's
 * template in `locale`; the link opens Firebase's reset page, which then
 * offers a button back to `continueUrl` (it must be on an authorized domain).
 * Throws IdentityToolkitError (e.g. EMAIL_NOT_FOUND, RESET_PASSWORD_EXCEED_LIMIT).
 * The link goes to the console's Action URL: our /auth/action page.
 */
export async function sendPasswordResetEmail(
    email: string,
    { locale, continueUrl }: { locale: string; continueUrl: string }
): Promise<void> {
    await callIdentityToolkit(
        'sendOobCode',
        { requestType: 'PASSWORD_RESET', email, continueUrl },
        { 'X-Firebase-Locale': locale }
    );
}

/** Checks a reset code without using it. Returns the account's email. */
export async function verifyPasswordResetCode(
    oobCode: string
): Promise<string> {
    const { email } = await callIdentityToolkit<{ email: string }>(
        'resetPassword',
        { oobCode }
    );
    return email;
}

/** Uses the code to set a new password. Returns the account's email. */
export async function confirmPasswordReset(
    oobCode: string,
    newPassword: string
): Promise<string> {
    const { email } = await callIdentityToolkit<{ email: string }>(
        'resetPassword',
        { oobCode, newPassword }
    );
    return email;
}
