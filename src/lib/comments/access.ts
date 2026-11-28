import 'server-only';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getDefinition } from '@/lib/definitions/store';

import type { CommentTarget } from './index';

// Who moderates each kind of discussion, and what the admin log calls its
// target. Dictionary words: super users. Organizations (later) will name
// their own owners and moderators here, and super users won't moderate
// claimed organizations' comments (AGENTS.md → super users stay narrow).

export function canModerate(
    target: CommentTarget,
    uid: string | null | undefined
): boolean {
    switch (target.kind) {
        case 'definition':
            return isPlatformAdmin(uid);
    }
}

/** What the admin log calls the target: a word's English name. */
export async function targetName(target: CommentTarget): Promise<string> {
    switch (target.kind) {
        case 'definition':
            return (await getDefinition(target.id))?.text.en.word ?? target.id;
    }
}
