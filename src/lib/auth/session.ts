import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { connection } from 'next/server';

import { getAdminAuth } from '@/lib/firebase/admin';

// Server-side sessions using Firebase session cookies: httpOnly, verified with
// the Admin SDK on every read. Reading it uses cookies(), so with Cache
// Components any component that calls getSessionUser() must sit inside a
// <Suspense> boundary.

export const SESSION_COOKIE = '__session';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

/** Exchange a fresh Firebase ID token for a session cookie. */
export async function startSession(idToken: string): Promise<void> {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
        expiresIn: FIVE_DAYS_MS,
    });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: FIVE_DAYS_MS / 1000,
    });
}

/** The signed-in user, or null. Checks revocation, so sign-out takes effect everywhere. */
export async function getSessionUser(): Promise<DecodedIdToken | null> {
    // Verifying checks the cookie's expiry against the current time. With
    // partial prefetching, Next may prerender this at runtime with cookies but
    // without a clock, and logs "unstable value Date.now()". Marking it
    // request-time avoids that.
    await connection();
    const sessionCookie = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!sessionCookie) return null;
    try {
        return await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch {
        return null;
    }
}

export async function endSession(): Promise<void> {
    const user = await getSessionUser();
    (await cookies()).delete(SESSION_COOKIE);
    if (user) {
        await getAdminAuth()
            .revokeRefreshTokens(user.uid)
            .catch(() => undefined);
    }
}
