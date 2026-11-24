// Super users ("platform admins"): a few accounts that can do what no one
// else can, such as adding unclaimed organizations and deciding claims.
// Pure: no React, Next or Firebase. The server gate is
// src/lib/auth/platform-admin.ts. Design: documentation/features/18-unclaimed-organizations.md.

import type { OrgRole } from './organizations/membership';

export type Env = Record<string, string | undefined>;

/**
 * The super users' UIDs: `PLATFORM_ADMIN_UIDS` (comma or space separated, set
 * per environment, never in the repo), plus the seeded test super users when
 * running locally against the emulators.
 */
export function platformAdminUids(
    env: Env,
    localDev: boolean,
    seededAdmins: readonly string[]
): Set<string> {
    const listed = (env.PLATFORM_ADMIN_UIDS ?? '')
        .split(/[\s,]+/)
        .map((uid) => uid.trim())
        .filter(Boolean);
    return new Set(localDev ? [...listed, ...seededAdmins] : listed);
}

/**
 * The role someone acts with in an organization. On an unclaimed
 * organization every super user acts as an owner, without a membership, so
 * none of them is ever listed as one. Everywhere else it's their membership.
 */
export function effectiveRole(
    membershipRole: OrgRole | null,
    org: { unclaimed: boolean },
    platformAdmin: boolean
): OrgRole | null {
    if (org.unclaimed) return platformAdmin ? 'owner' : null;
    return membershipRole;
}
