// Deleting, restoring, and handing an organization to the team as unclaimed:
// the rules, with no React, Next or Firebase. The Firestore layer is
// ./lifecycle-store.ts. Design: documentation/features/16-organizations.md →
// "Deleting", and features/18 → "Making an organization unclaimed".

import type { OrgRole } from './membership';

/** How long a super user can restore a deleted organization (and its handle is held). */
export const RESTORE_DAYS = 30;
const DAY_MS = 86_400_000;

/** When a deletion stops being restorable. */
export const restoreDeadline = (archivedAt: number) =>
    archivedAt + RESTORE_DAYS * DAY_MS;

export const canRestore = (archivedAt: number | undefined, now: number) =>
    archivedAt !== undefined && now < restoreDeadline(archivedAt);

/** Only owners delete (super users count as owners of unclaimed organizations). */
export const canDelete = (role: OrgRole | null) => role === 'owner';

/**
 * Whether what was typed confirms deleting `name`: the same text, ignoring
 * case, extra spaces and accents' composed forms. The server checks again.
 */
export function deleteConfirmed(typed: string, name: string): boolean {
    const tidy = (s: string) =>
        s.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    return tidy(typed) !== '' && tidy(typed) === tidy(name);
}

export type MakeUnclaimedProblem = 'notAllowed' | 'hasMembers' | 'unclaimed';

/**
 * A super user who added an organization the normal way (and so is its
 * owner) can hand it to the team as unclaimed, but only while they're its
 * only member: anyone else would silently lose their group.
 */
export function makeUnclaimedProblem({
    platformAdmin,
    role,
    unclaimed,
    activeMembers,
}: {
    platformAdmin: boolean;
    role: OrgRole | null;
    unclaimed: boolean;
    activeMembers: number;
}): MakeUnclaimedProblem | null {
    if (unclaimed) return 'unclaimed';
    if (!platformAdmin || role !== 'owner') return 'notAllowed';
    if (activeMembers > 1) return 'hasMembers';
    return null;
}
