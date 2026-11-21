import 'server-only';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { getLocale } from 'next-intl/server';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import { getUserProfile, type CompleteUserProfile } from '@/lib/users';
import { redirect } from '@/i18n/navigation';

/**
 * For any page that needs a usable account. Signed out → sign-in. Missing
 * required profile answers → /account/setup, which returns to `next` after.
 * Call it in a route container inside <Suspense> (it reads cookies).
 */
export async function requireAccount(next: string): Promise<{
    user: DecodedIdToken;
    profile: CompleteUserProfile;
    locale: string;
}> {
    const [locale, user] = await Promise.all([getLocale(), getSessionUser()]);
    if (!user) return redirect({ href: '/sign-in', locale });

    const profile = await getUserProfile(user.uid);
    if (!isSetupComplete(profile)) {
        return redirect({
            href: { pathname: '/account/setup', query: { next } },
            locale,
        });
    }
    return { user, profile: profile as CompleteUserProfile, locale };
}
