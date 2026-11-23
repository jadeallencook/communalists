// What an account needs before it can be used. Pure (no React, Next or
// Firebase), so the app, tests and a future native app share it.
//
// To require a new question: add a step here, decide what "answered" means in
// missingSetupSteps, and add the field to the setup form. Every account
// missing it is sent to /account/setup on its next visit; no data migration.

export const SETUP_STEPS = [
    'name',
    'username',
    'language',
    'location',
] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

/** The profile fields setup looks at. Every one may be missing (old accounts). */
export interface SetupProfile {
    displayName?: string | null;
    username?: string | null;
    locale?: string | null;
    location?: { placeId?: string | null } | null;
}

export function missingSetupSteps(
    profile: SetupProfile | null | undefined
): SetupStep[] {
    const answered: Record<SetupStep, boolean> = {
        name: !!profile?.displayName?.trim(),
        username: !!profile?.username,
        language: !!profile?.locale,
        location: !!profile?.location?.placeId,
    };
    return SETUP_STEPS.filter((step) => !answered[step]);
}

export const isSetupComplete = (profile: SetupProfile | null | undefined) =>
    missingSetupSteps(profile).length === 0;

export const DEFAULT_NEXT_PATH = '/dashboard';

/**
 * Makes a `?next=` value safe to redirect to: a path on this site, without a
 * locale prefix (the redirect adds one). Anything else becomes the fallback.
 */
export function safeNextPath(
    next: unknown,
    locales: readonly string[],
    fallback = DEFAULT_NEXT_PATH
): string {
    if (typeof next !== 'string' || !next.startsWith('/')) return fallback;
    // "//evil.com" and "/\evil.com" are other sites to a browser.
    if (next.startsWith('//') || next.startsWith('/\\')) return fallback;
    if (/[\u0000-\u001f]/.test(next)) return fallback;
    const [, first, ...rest] = next.split('/');
    const path = locales.includes(first ?? '') ? `/${rest.join('/')}` : next;
    // Never loop back into setup itself.
    if (path === '/account/setup' || path.startsWith('/account/setup?'))
        return fallback;
    return path;
}
