import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminPageLoading } from '@/components/pages/admin-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import { getDefinitions } from '@/lib/definitions/store';
import { getAdminAuth } from '@/lib/firebase/admin';
import {
    getAdminLog,
    getPendingClaims,
    getUnclaimedOrganizations,
} from '@/lib/organizations/claim-store';
import { restoreDeadline } from '@/lib/organizations/lifecycle';
import { getRecentlyDeleted } from '@/lib/organizations/lifecycle-store';
import { getUserProfile } from '@/lib/users';

import { AdminContainer } from './admin-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Admin');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page. Streams behind <Suspense>.
export default function Page() {
    return (
        <Suspense fallback={<AdminPageLoading />}>
            <AdminServerContainer />
        </Suspense>
    );
}

async function AdminServerContainer() {
    await requirePlatformAdmin('/admin');
    const [claims, unclaimed, deleted, log, definitions, format, t] =
        await Promise.all([
            getPendingClaims(),
            getUnclaimedOrganizations(),
            getRecentlyDeleted(),
            getAdminLog(),
            getDefinitions(),
            getFormatter(),
            getTranslations('Admin'),
        ]);
    const date = (at?: number) =>
        at ? format.dateTime(new Date(at), { dateStyle: 'medium' }) : '';

    // Account emails, so the team can follow up on a request. Never cached,
    // never sent anywhere but this page.
    const emails = new Map<string, string | undefined>();
    await Promise.all(
        [...new Set(claims.map((c) => c.uid))].map(async (uid) => {
            const account = await getAdminAuth()
                .getUser(uid)
                .catch(() => null);
            emails.set(uid, account?.email);
        })
    );
    // Super users' names for the log (cached profile reads).
    const names = new Map<string, string>();
    await Promise.all(
        [...new Set(log.map((e) => e.actorUid))].map(async (uid) => {
            const profile = await getUserProfile(uid);
            names.set(uid, profile?.displayName || t('unknownActor'));
        })
    );

    return (
        <AdminContainer
            claims={claims.map((c) => ({
                orgId: c.orgId,
                uid: c.uid,
                orgName: c.org.name,
                handle: c.org.handle,
                intent: c.intent,
                role: c.role,
                message: c.message,
                claimantName: c.claimant.displayName,
                claimantUsername: c.claimant.username,
                claimantEmail: emails.get(c.uid),
                requestedOn: date(c.requestedAt),
            }))}
            unclaimed={unclaimed.map((org) => ({
                name: org.name,
                handle: org.handle,
                focusAreas: org.focusAreas,
                detail: org.place,
            }))}
            deleted={deleted.map((org) => ({
                orgId: org.id,
                name: org.name,
                deletedOn: date(org.archivedAt),
                restoreUntil: date(restoreDeadline(org.archivedAt)),
            }))}
            definitionCount={definitions.length}
            log={log.map((entry) => ({
                id: entry.id,
                action: entry.action,
                orgName: entry.orgName,
                actorName: names.get(entry.actorUid) ?? t('unknownActor'),
                targetName: entry.targetName,
                word: entry.word,
                on: date(entry.at),
            }))}
        />
    );
}
