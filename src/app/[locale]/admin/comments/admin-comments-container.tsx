'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
    AdminCommentsPage,
    type AdminReportedComment,
} from '@/components/pages/admin-comments-page';
import type { CommentTarget } from '@/lib/comments';

import {
    deleteCommentAction,
    dismissReportAction,
    hideCommentAction,
    type ModerationState,
} from '../../../actions/comments';

type Item = AdminReportedComment & { target: CommentTarget; commentId: string };

/** Hide, delete or dismiss from /admin/comments; the row goes once it's handled. */
export function AdminCommentsContainer({ items: initial }: { items: Item[] }) {
    const t = useTranslations('AdminComments');
    const tErrors = useTranslations('Discussion.errors');
    const [items, setItems] = useState(initial);
    const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
    const [notice, setNotice] = useState<{
        tone: 'status' | 'alert';
        text: string;
        at: number;
    } | null>(null);

    const act =
        (
            run: (item: Item) => Promise<ModerationState>,
            done: 'hidden' | 'deleted' | 'dismissed'
        ) =>
        async (key: string) => {
            const item = items.find((i) => i.key === key);
            if (!item) return;
            setBusy((b) => new Set(b).add(key));
            let result: ModerationState;
            try {
                result = await run(item);
            } catch {
                result = { ok: false, error: 'generic' };
            }
            setBusy((b) => {
                const copy = new Set(b);
                copy.delete(key);
                return copy;
            });
            // A comment or report that's already gone is handled too.
            if (result.ok || result.error === 'notFound') {
                setItems((list) => list.filter((i) => i.key !== key));
                setNotice({ tone: 'status', text: t(done), at: Date.now() });
            } else {
                setNotice({
                    tone: 'alert',
                    text: tErrors(result.error, { max: 0, time: '' }),
                    at: Date.now(),
                });
            }
        };

    return (
        <AdminCommentsPage
            items={items}
            busy={busy}
            notice={notice}
            onHide={act(
                (item) => hideCommentAction(item.target, item.commentId, true),
                'hidden'
            )}
            onDelete={act(
                (item) => deleteCommentAction(item.target, item.commentId),
                'deleted'
            )}
            onDismiss={act(
                (item) => dismissReportAction(item.target, item.commentId),
                'dismissed'
            )}
        />
    );
}
