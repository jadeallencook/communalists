import 'server-only';

import { notFound } from 'next/navigation';

import { requireAccount } from '@/lib/auth/require-account';
import { isLocalDev, SEEDED_PLATFORM_ADMINS } from '@/lib/dev';
import { platformAdminUids } from '@/lib/platform-admin';

// The server gate for super users. The list comes from PLATFORM_ADMIN_UIDS
// (per environment, set on Vercel and in .env.local), plus the seeded test
// super user when running locally. Read on every call, so removing a UID
// takes effect on the next deploy (or restart, locally).

export function isPlatformAdmin(uid: string | null | undefined): boolean {
    if (!uid) return false;
    return platformAdminUids(
        process.env,
        isLocalDev(process.env),
        SEEDED_PLATFORM_ADMINS
    ).has(uid);
}

/**
 * For super-user pages: requireAccount, then a not-found page for anyone
 * else, so the page doesn't reveal that it exists.
 */
export async function requirePlatformAdmin(next: string) {
    const account = await requireAccount(next);
    if (!isPlatformAdmin(account.user.uid)) notFound();
    return account;
}
