import 'server-only';

import { callIdentityToolkit, IdentityToolkitError } from './identity-toolkit';

// Signs in with email + password to get an ID token on the server, which
// startSession() exchanges for a session cookie. Used by sign-up and sign-in,
// so both are single server actions that work without client-side Firebase.
// Throws IdentityToolkitError (e.g. INVALID_LOGIN_CREDENTIALS).
export async function signInWithPassword(
    email: string,
    password: string
): Promise<string> {
    const { idToken } = await callIdentityToolkit<{ idToken?: string }>(
        'signInWithPassword',
        { email, password, returnSecureToken: true }
    );
    if (!idToken) throw new IdentityToolkitError('NO_ID_TOKEN');
    return idToken;
}
