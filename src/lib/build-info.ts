// Which build is running: the package.json version (bumped by hand at
// milestones) plus the git commit Vercel built from (automatic, so it can't
// go stale). next.config.ts puts both in env vars at build time.

export const REPOSITORY_URL = 'https://github.com/techletariats/communalists';

export interface BuildInfo {
    version: string;
    /** Short commit hash, or null outside Vercel (local dev and builds). */
    commit: string | null;
    commitUrl: string | null;
}

export function buildInfo(
    version: string | undefined,
    commitSha: string | undefined
): BuildInfo {
    const sha = commitSha?.trim().toLowerCase();
    const valid = !!sha && /^[0-9a-f]{7,40}$/.test(sha);
    return {
        version: version || '0.0.0',
        commit: valid ? sha.slice(0, 7) : null,
        commitUrl: valid ? `${REPOSITORY_URL}/commit/${sha}` : null,
    };
}

/** This build's info, from the values next.config.ts inlined. */
export const currentBuild = () =>
    buildInfo(
        process.env.NEXT_PUBLIC_APP_VERSION,
        process.env.NEXT_PUBLIC_COMMIT_SHA
    );
