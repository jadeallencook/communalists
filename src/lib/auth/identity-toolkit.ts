import 'server-only';

// Firebase Auth's REST API (Identity Toolkit), for the calls the Admin SDK
// can't make: signing in with a password and sending password-reset emails.
// Talks to the Auth emulator when FIREBASE_AUTH_EMULATOR_HOST is set.

/** A Firebase Auth REST error, with its code (e.g. INVALID_LOGIN_CREDENTIALS). */
export class IdentityToolkitError extends Error {
    constructor(public readonly code: string) {
        super(`Firebase Auth request failed: ${code}`);
        this.name = 'IdentityToolkitError';
    }
}

export async function callIdentityToolkit<T>(
    method: string,
    body: Record<string, unknown>,
    headers: Record<string, string> = {}
): Promise<T> {
    const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const base = emulator
        ? `http://${emulator}/identitytoolkit.googleapis.com`
        : 'https://identitytoolkit.googleapis.com';
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'emulator';

    const response = await fetch(
        `${base}/v1/accounts:${method}?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...headers },
            body: JSON.stringify(body),
        }
    );
    const json = (await response.json()) as T & {
        error?: { message?: string };
    };
    if (!response.ok || json.error) {
        // Messages look like "INVALID_LOGIN_CREDENTIALS" or
        // "TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account…".
        const code =
            json.error?.message?.split(/[\s:]/)[0] || String(response.status);
        throw new IdentityToolkitError(code);
    }
    return json;
}
