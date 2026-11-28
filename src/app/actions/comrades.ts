'use server';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { isSetupComplete, safeNextPath } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import {
    comradeActionSchema,
    type ComradeIntent,
    type ComradeState,
} from '@/lib/comrades';
import { changeComradeship, comradesTag } from '@/lib/comrades/store';
import { notificationsTag } from '@/lib/notifications/store';
import { getMemberships } from '@/lib/organizations';
import { getUserProfileFresh, userTag } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { rotateUserPhoto } from './rotate-user-photo';
import { syncMemberCopies } from './sync-member-copies';

// Comrade requests (decision #74): send, take back, accept, decline, and
// remove a comrade. Used by the button on a profile and the request lists on
// the dashboard and /notifications. Every check runs here on fresh data
// (src/lib/comrades/store.ts); what the page showed is a convenience.

export interface ComradeActionState {
    error?: 'notFound' | 'closed' | 'limit' | 'generic';
    /** What was asked for, when it went through. */
    done?: ComradeIntent;
    /** What the viewer sees now. */
    state?: ComradeState;
    /** Who it was about, so a list knows which row changed. */
    uid?: string;
    /** Changes on every submit, so the same message can show twice. */
    at?: number;
}

const text = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
};

export async function comradeAction(
    _prev: ComradeActionState,
    formData: FormData
): Promise<ComradeActionState> {
    const requested = text(formData, 'locale');
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
    const back = safeNextPath(text(formData, 'next'), routing.locales);
    const at = Date.now();

    const user = await getSessionUser();
    if (!user)
        return redirect({
            href: { pathname: '/sign-in', query: { next: back } },
            locale,
        });
    const parsed = comradeActionSchema.safeParse({
        uid: text(formData, 'uid'),
        intent: text(formData, 'intent'),
    });
    if (!parsed.success) return { error: 'generic', at };
    const { uid: other, intent } = parsed.data;

    let result;
    try {
        let sharesGroup = false;
        if (intent === 'request' || intent === 'accept') {
            // Comrades show on profiles: the viewer needs a username.
            const profile = await getUserProfileFresh(user.uid);
            if (!isSetupComplete(profile))
                return redirect({
                    href: { pathname: '/account/setup', query: { next: back } },
                    locale,
                });
        }
        if (intent === 'request') {
            const [mine, theirs] = await Promise.all([
                getMemberships(user.uid),
                getMemberships(other),
            ]);
            const orgs = new Set(mine.map((m) => m.orgId));
            sharesGroup = theirs.some((m) => orgs.has(m.orgId));
        }
        result = await changeComradeship({
            viewer: user.uid,
            other,
            intent,
            sharesGroup,
        });
    } catch (error) {
        console.error('[comrades] change failed', (error as Error).message); // never log PII
        return { error: 'generic', uid: other, at };
    }
    if (!result.ok) return { error: result.error, uid: other, at };

    for (const uid of [user.uid, other]) {
        updateTag(comradesTag(uid)); // profiles, lists and buttons
        updateTag(notificationsTag(uid)); // the bell and the inbox
    }
    if (result.removed) await movePhotos([user.uid, other]);
    refresh();
    return { done: intent, state: result.state, uid: other, at };
}

/**
 * After two people stop being comrades, each could still open the other's
 * photo link. Like sharing with fewer people (decision #71), a photo that
 * isn't public moves to a new link. A failure here doesn't undo the removal,
 * so it's logged.
 */
async function movePhotos(uids: string[]) {
    await Promise.all(
        uids.map(async (uid) => {
            try {
                const profile = await getUserProfileFresh(uid);
                if (!profile?.photo || profile.profile.visibility === 'public')
                    return;
                await rotateUserPhoto(uid, profile.photo);
                updateTag(userTag(uid));
                await syncMemberCopies(uid);
            } catch (error) {
                console.error(
                    '[comrades] photo move failed',
                    (error as Error).message
                );
            }
        })
    );
}
