import 'server-only';

// Signs in with email + password through Firebase Auth's REST API to get an
// ID token on the server, which startSession() exchanges for a session cookie.
// Keeps sign-up a single server action (works without client-side Firebase).
export async function signInWithPassword(
    email: string,
    password: string
): Promise<string> {
    const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const base = emulator
        ? `http://${emulator}/identitytoolkit.googleapis.com`
        : 'https://identitytoolkit.googleapis.com';
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'emulator';

    const response = await fetch(
        `${base}/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
    );
    const body = (await response.json()) as {
        idToken?: string;
        error?: { message?: string };
    };
    if (!response.ok || !body.idToken) {
        throw new Error(
            `Sign-in failed: ${body.error?.message ?? response.status}`
        );
    }
    return body.idToken;
}
