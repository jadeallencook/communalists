// Which build is running: the git commit Vercel built from (automatic, so it
// can't go stale; decision #46 dropped the hand-bumped version number).
// next.config.ts puts it in an env var at build time.

export const REPOSITORY_URL = 'https://github.com/jadeallencook/communalists';

export interface BuildInfo {
    /** Short commit hash, or null outside Vercel (local dev and builds). */
    commit: string | null;
    commitUrl: string | null;
}

export function buildInfo(commitSha: string | undefined): BuildInfo {
    const sha = commitSha?.trim().toLowerCase();
    const valid = !!sha && /^[0-9a-f]{7,40}$/.test(sha);
    return {
        commit: valid ? sha.slice(0, 7) : null,
        commitUrl: valid ? `${REPOSITORY_URL}/commit/${sha}` : null,
    };
}

/** This build's info, from the value next.config.ts inlined. */
export const currentBuild = () => buildInfo(process.env.NEXT_PUBLIC_COMMIT_SHA);
