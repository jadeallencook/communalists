import { createHash } from 'node:crypto';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import {
    cursorOf,
    DISCUSSION_ANCHOR,
    encodeCursor,
    targetHref,
    type CommentTarget,
} from '@/lib/comments';
import { canModerate } from '@/lib/comments/access';
import { getCommentCount, getComments } from '@/lib/comments/store';
import { viewsFor } from '@/lib/comments/views';
import { getUserProfile, getUserProfileFresh } from '@/lib/users';
import type { DiscussionViewer } from '@/components/organisms/discussion';
import type { Locale } from '@/i18n/routing';

import { DiscussionClient } from './discussion-client';

// The discussion under a word (documentation/features/20-comments.md). Reads
// the session, so it streams in its own <Suspense> and the word never waits
// on it. The first page and the count are cached; what the viewer voted for
// is read fresh.

export async function DiscussionContainer({
    slug,
    locale,
}: {
    slug: string;
    locale: Locale;
}) {
    const target: CommentTarget = { kind: 'definition', id: slug };
    const [user, page, count] = await Promise.all([
        getSessionUser(),
        getComments(target, 'top', null),
        getCommentCount(target),
    ]);
    const uid = user?.uid ?? null;
    const moderator = canModerate(target, uid);
    const comments = await viewsFor(target, page.comments, { uid, moderator });
    const last = page.comments.at(-1);
    const viewer = await viewerOf(target, uid, moderator);
    return (
        <DiscussionClient
            // Next keeps recently visited pages alive with their state. A new
            // key per viewer starts the list fresh after signing in or out, so
            // nobody sees another viewer's votes or buttons. Hashed: the uid
            // itself never reaches the page.
            key={`${viewer.status}:${uid ? createHash('sha256').update(uid).digest('hex').slice(0, 16) : ''}`}
            target={target}
            viewer={viewer}
            initial={{
                comments,
                next: page.more && last ? encodeCursor(cursorOf(last)) : null,
            }}
            count={count}
            defaultLang={locale}
        />
    );
}

async function viewerOf(
    target: CommentTarget,
    uid: string | null,
    moderator: boolean
): Promise<DiscussionViewer> {
    // Sign-up, sign-in and setup all come back to the discussion.
    const next = encodeURIComponent(
        `${targetHref(target)}#${DISCUSSION_ANCHOR}`
    );
    if (!uid)
        return {
            status: 'signedOut',
            signUpHref: `/sign-up?next=${next}`,
            signInHref: `/sign-in?next=${next}`,
        };
    let profile = await getUserProfile(uid);
    if (!isSetupComplete(profile)) profile = await getUserProfileFresh(uid);
    if (!isSetupComplete(profile))
        return {
            status: 'setupNeeded',
            setupHref: `/account/setup?next=${next}`,
        };
    return { status: 'ready', moderator };
}
