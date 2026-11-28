import { getSessionUser } from '@/lib/auth/session';
import {
    commentTargetSchema,
    decodeCursor,
    encodeCursor,
    cursorOf,
    isCommentSort,
    isLanguageFilter,
    type CommentView,
} from '@/lib/comments';
import { canModerate, discussionReadable } from '@/lib/comments/access';
import { getComments } from '@/lib/comments/store';
import { viewsFor } from '@/lib/comments/views';

// GET /api/comments/{kind}/{id}?sort=top|newest&lang=all|en|es|vi|zh&after={cursor}
//   → { comments: CommentView[], next: string | null }
// The next page of a discussion, or the first page in another order or language
// (documentation/features/20-comments.md). Comments are public; what the
// viewer voted for and may do depends on their session, so the answer is
// private and never stored by the CDN. The page reads are cached on the server.

export interface CommentsPage {
    comments: CommentView[];
    next: string | null;
}

export async function GET(
    request: Request,
    { params }: RouteContext<'/api/comments/[kind]/[id]'>
) {
    const target = commentTargetSchema.safeParse(await params);
    const query = new URL(request.url).searchParams;
    const sort = query.get('sort');
    const after = query.get('after');
    // Missing means all languages (older clients).
    const language = query.get('lang') ?? 'all';
    const cursor = after ? decodeCursor(after) : null;
    if (
        !target.success ||
        !isCommentSort(sort) ||
        !isLanguageFilter(language) ||
        (after && !cursor)
    )
        return Response.json({ error: 'invalid' }, { status: 400 });
    // An unlisted or deleted organization's discussion isn't public.
    if (!(await discussionReadable(target.data)))
        return Response.json({ error: 'notFound' }, { status: 404 });

    const [user, page] = await Promise.all([
        getSessionUser(),
        getComments(target.data, sort, cursor, language),
    ]);
    const uid = user?.uid ?? null;
    const comments = await viewsFor(target.data, page.comments, {
        uid,
        moderator: canModerate(target.data, uid),
    });
    const last = page.comments.at(-1);
    const body: CommentsPage = {
        comments,
        next: page.more && last ? encodeCursor(cursorOf(last)) : null,
    };
    return Response.json(body, {
        headers: { 'cache-control': 'private, no-store' },
    });
}
