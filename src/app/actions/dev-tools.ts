'use server';

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { refresh, updateTag } from 'next/cache';
import { hasLocale } from 'next-intl';

import { DEFAULT_NEXT_PATH } from '@/lib/account-setup';
import { signInWithPassword } from '@/lib/auth/password-sign-in';
import { startSession } from '@/lib/auth/session';
import { COMMENT_REPORTS_TAG, commentsTag } from '@/lib/comments/store';
import { comradesTag } from '@/lib/comrades/store';
import {
    DEFINITIONS_TAG,
    definitionTag,
    getDefinitionSlugsFresh,
} from '@/lib/definitions/store';
import { notificationsTag } from '@/lib/notifications/store';
import { isLocalDev, isTestAccount, SEEDED, TEST_PASSWORD } from '@/lib/dev';
import {
    DIRECTORY_TAG,
    handleTag,
    membershipsTag,
    orgMembersTag,
    orgTag,
} from '@/lib/organizations';
import { userTag, usernameTag } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// The dev toolbar's actions. Server actions can be called directly by anyone
// who knows their id, rendered or not, so each one checks isLocalDev itself.
// That check is what keeps these out of production.

function assertLocalDev() {
    if (!isLocalDev(process.env)) {
        throw new Error('Dev tools are only available in local development.');
    }
}

const localeFrom = (formData: FormData) => {
    const requested = formData.get('locale');
    return typeof requested === 'string' &&
        hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;
};

/** One-click sign-in as a seeded test account, then the dashboard. */
export async function devSignIn(formData: FormData): Promise<void> {
    assertLocalDev();
    const email = formData.get('email');
    if (typeof email !== 'string' || !isTestAccount(email)) {
        throw new Error('Only seeded test accounts can be used here.');
    }
    await startSession(await signInWithPassword(email, TEST_PASSWORD));
    redirect({ href: DEFAULT_NEXT_PATH, locale: localeFrom(formData) });
}

export interface ResetTestDataState {
    status?: 'done' | 'failed';
    /** When it finished, so the toolbar can show it again after another reset. */
    at?: number;
}

/** Runs `pnpm seed` (scripts/seed.mjs) and clears what it changed from the cache. */
export async function resetTestData(): Promise<ResetTestDataState> {
    assertLocalDev();
    try {
        await promisify(execFile)(
            process.execPath,
            [
                // seed.mjs imports src/lib/csv.ts; Node strips its types but
                // warns that package.json has no "type". Harmless.
                '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
                'scripts/seed.mjs',
                '--from-app',
            ],
            { cwd: process.cwd(), timeout: 60_000 }
        );
    } catch (error) {
        console.error('[dev] reset test data failed', (error as Error).message);
        return { status: 'failed', at: Date.now() };
    }
    for (const username of SEEDED.usernames) updateTag(usernameTag(username));
    for (const uid of SEEDED.uids) {
        updateTag(userTag(uid));
        updateTag(membershipsTag(uid));
        updateTag(comradesTag(uid));
        updateTag(notificationsTag(uid));
    }
    for (const { id, handle } of SEEDED.organizations) {
        updateTag(orgTag(id));
        updateTag(handleTag(handle));
        updateTag(orgMembersTag(id));
    }
    updateTag(DIRECTORY_TAG);
    updateTag(DEFINITIONS_TAG);
    // Seeded words come from research/definitions/; clear every word's page.
    // …and its discussion (seeded comments are reset too).
    for (const slug of await getDefinitionSlugsFresh()) {
        updateTag(definitionTag(slug));
        updateTag(commentsTag({ kind: 'definition', id: slug }));
    }
    updateTag(COMMENT_REPORTS_TAG);
    refresh();
    return { status: 'done', at: Date.now() };
}
