import 'server-only';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getDefinition } from '@/lib/definitions/store';
import { getOrganizationById } from '@/lib/organizations';

import type { CommentTarget } from './index';

// Who moderates each kind of discussion, and what the admin log calls its
// target. Super users moderate both: dictionary words, and organizations'
// pages, claimed ones included, so a group can't quietly remove criticism of
// itself (decision #70). They get nothing members-only from it. An
// organization's owners and moderators write its replies instead
// (store.ts → postReply), and can report like anyone.

export function canModerate(
    target: CommentTarget,
    uid: string | null | undefined
): boolean {
    switch (target.kind) {
        case 'definition':
        case 'organization':
            return isPlatformAdmin(uid);
    }
}

/** What the admin log calls the target: a word's English name, or the organization's name. */
export async function targetName(target: CommentTarget): Promise<string> {
    switch (target.kind) {
        case 'definition':
            return (await getDefinition(target.id))?.text.en.word ?? target.id;
        case 'organization':
            return (await getOrganizationById(target.id))?.name ?? target.id;
    }
}

/**
 * Whether a target's discussion can be read now (cached): words always;
 * organizations while active and listed. Writes check the same on fresh
 * data in their transactions.
 */
export async function discussionReadable(
    target: CommentTarget
): Promise<boolean> {
    switch (target.kind) {
        case 'definition':
            return true;
        case 'organization': {
            const org = await getOrganizationById(target.id);
            return org?.status === 'active' && org.visibility === 'listed';
        }
    }
}
