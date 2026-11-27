'use client';

import { useCallback, useEffect, useState } from 'react';

export type CopyLinkStatus = 'idle' | 'copied' | 'failed';

/**
 * Copies a link to the clipboard and reports how it went, so the button can
 * announce it. Goes back to `idle` after a few seconds. `copy` is injectable
 * for stories and tests.
 */
export function useCopyLink(
    url: string,
    copy: (text: string) => Promise<void> = (text) =>
        navigator.clipboard.writeText(text)
) {
    const [status, setStatus] = useState<CopyLinkStatus>('idle');
    useEffect(() => {
        if (status === 'idle') return;
        const timer = setTimeout(() => setStatus('idle'), 5000);
        return () => clearTimeout(timer);
    }, [status]);
    const onCopy = useCallback(async () => {
        try {
            await copy(url);
            setStatus('copied');
        } catch {
            setStatus('failed');
        }
    }, [copy, url]);
    return { status, onCopy };
}
