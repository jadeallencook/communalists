// Organization handles: the unique public address, communalists.com/org/{handle}.
// Pure rules; uniqueness is enforced on the server with handles/{handle}
// (see src/lib/organizations/index.ts). Design: features/16-organizations.md.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;

/** Words no organization can take: app routes, infrastructure, and the locale codes. */
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
