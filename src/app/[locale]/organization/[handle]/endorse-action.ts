'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import { endorseSchema } from '@/lib/endorsements';
import { endorsementsTag, setEndorsement } from '@/lib/endorsements/store';
import { orgTag } from '@/lib/organizations';
import { organizationPath } from '@/lib/paths';
import { getUserProfileFresh } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// Endorsing an organization, or taking it back (decision #73). The server
// checks again that it can be endorsed; the card shown is a convenience.

export interface EndorseActionState {
    error?: 'notFound' | 'generic';
    done?: 'endorsed' | 'removed';
    /** Changes on every submit, so the same message can show twice. */
    at?: number;
}

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};

export async function endorseAction(
    _prev: EndorseActionState,
    formData: FormData
): Promise<EndorseActionState> {
    const requested = text(formData, 'locale');
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const handle = text(formData, 'handle');
    const back = organizationPath(handle);
    const at = Date.now();

    const user = await getSessionUser();
    if (!user)
        return redirect({
            href: { pathname: '/sign-in', query: { next: back } },
            locale,
        });
    const parsed = endorseSchema.safeParse({
        orgId: text(formData, 'orgId'),
        intent: text(formData, 'intent'),
    });
    if (!parsed.success) return { error: 'generic', at };
    const { orgId, intent } = parsed.data;

    try {
        if (intent === 'endorse') {
            // Endorsements show on the profile: it needs a username.
            const profile = await getUserProfileFresh(user.uid);
            if (!isSetupComplete(profile))
                return redirect({
                    href: { pathname: '/account/setup', query: { next: back } },
                    locale,
                });
        }
        const result = await setEndorsement(
            orgId,
            user.uid,
            intent === 'endorse'
        );
        if (!result.ok) return { error: result.error, at };
    } catch (error) {
        console.error('[endorsements] set failed', (error as Error).message); // never log PII
        return { error: 'generic', at };
    }
    updateTag(orgTag(orgId)); // the count on its page
    updateTag(endorsementsTag(user.uid)); // their profile and this card
    refresh();
    return { done: intent === 'endorse' ? 'endorsed' : 'removed', at };
}
