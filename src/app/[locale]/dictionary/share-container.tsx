'use client';

import { useTranslations } from 'next-intl';

import { CopyLinkButton } from '@/components/molecules/copy-link-button';
import { useCopyLink } from '@/hooks/use-copy-link';
import { track } from '@/lib/analytics';

/** The word page's copy-link button. */
export function ShareContainer({ url, slug }: { url: string; slug: string }) {
    const t = useTranslations('Dictionary.share');
    const { status, onCopy } = useCopyLink(url);
    return (
        <CopyLinkButton
            url={url}
            status={status}
            onCopy={onCopy}
            labels={{
                copy: t('copy'),
                copied: t('copied'),
                failed: t('failed'),
            }}
            buttonProps={track('definition-share', { slug })}
        />
    );
}
