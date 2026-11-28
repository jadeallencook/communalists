import 'server-only';

import { updateTag } from 'next/cache';

import {
    memberCopyOf,
    orgMembersTag,
    syncMemberCopy,
} from '@/lib/organizations';
import { getUserProfileAfterWrite } from '@/lib/users';

/**
 * Brings the copy of a person on their memberships (name, username, photo
 * link, visibility) up to date with their saved profile, and clears the
 * member lists that changed. Call it from server actions (updateTag) after
 * the profile is saved. A failure leaves an old copy on a list, so it's
 * logged, never thrown: the save itself already worked.
 */
export async function syncMemberCopies(uid: string): Promise<void> {
    try {
        const profile = await getUserProfileAfterWrite(uid);
        if (!profile?.displayName) return;
        const orgIds = await syncMemberCopy(uid, memberCopyOf(profile));
        for (const orgId of orgIds) updateTag(orgMembersTag(orgId));
    } catch (error) {
        console.error(
            '[profile] member copy sync failed',
            (error as Error).message
        ); // never log PII
    }
}
