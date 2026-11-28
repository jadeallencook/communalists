// Organization handles (communalists.com/organization/{handle}) and usernames
// (communalists.com/comrade/{username}) share these rules.
// Pure rules; uniqueness is enforced on the server with handles/{handle}
// (see src/lib/organizations/index.ts). Design: features/16-organizations.md.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;

/** Words no organization or person can take: app routes, infrastructure, and the locale codes. */
export const RESERVED_HANDLES = new Set([
    'www',
    'app',
    'api',
    'admin',
    'auth',
    'dashboard',
    'account',
    'org',
    'orgs',
    'organization',
    'organizations',
    'event',
    'events',
    'new',
    'settings',
    'help',
    'support',
    'status',
    'docs',
    'blog',
    'mail',
    'storybook',
    'static',
    'assets',
    'cdn',
    'dev',
    'staging',
    'communalists',
    'comrade',
    'comrades',
    'people',
    'person',
    'profile',
    'me',
    'find',
    'sign-in',
    'sign-up',
    'en',
    'es',
    'vi',
    'zh',
]);

export type HandleProblem = 'tooShort' | 'tooLong' | 'format' | 'reserved';

/** Why a handle can't be used (ignoring whether it's taken), or null if it can. */
export function handleProblem(handle: string): HandleProblem | null {
    if (handle.length < HANDLE_MIN) return 'tooShort';
    if (handle.length > HANDLE_MAX) return 'tooLong';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(handle)) return 'format';
    if (RESERVED_HANDLES.has(handle)) return 'reserved';
    return null;
}

/** Lower-cases and trims what someone typed, without "fixing" anything else. */
export const normalizeHandle = (input: string) => input.trim().toLowerCase();

/** "South Bay Mutual Aid!" → "south-bay-mutual-aid"; "Ayuda Mutua Peñón" → "ayuda-mutua-penon". */
export function suggestHandle(name: string): string {
    return name
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, HANDLE_MAX)
        .replace(/-+$/g, '');
}

// --- Changing a handle (owners only). Once every 30 days; the old handle is
// held for 30 days so nobody else can claim it and pose as the group to
// people following old links. No redirects (decision #22).

export const HANDLE_CHANGE_COOLDOWN_DAYS = 30;
export const HANDLE_HOLD_DAYS = 30;
const DAY_MS = 86_400_000;

/** When the handle may next change (epoch ms), or null if it may change now. */
export function nextHandleChangeAt(
    lastChangedAt: number | undefined,
    now: number = Date.now()
): number | null {
    if (!lastChangedAt) return null;
    const next = lastChangedAt + HANDLE_CHANGE_COOLDOWN_DAYS * DAY_MS;
    return next > now ? next : null;
}

/** Until when an old handle stays held, from the moment it's released. */
export const handleHeldUntil = (now: number) => now + HANDLE_HOLD_DAYS * DAY_MS;

/**
 * Whether a `handles/{handle}` claim stops `orgId` from taking the handle:
 * another organization's claim does, unless it's a hold that has run out.
 * An organization can always take back its own handle.
 */
export function claimBlocks(
    claim: { orgId: string; heldUntil?: number } | null,
    orgId: string | null,
    now: number
): boolean {
    if (!claim) return false;
    if (claim.orgId === orgId) return false;
    return !(claim.heldUntil !== undefined && claim.heldUntil <= now);
}
