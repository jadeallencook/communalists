import { CheckIcon, LinkIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import type { CopyLinkStatus } from '@/hooks/use-copy-link';

export interface CopyLinkButtonProps {
    /** The link, shown when copying fails so it can be copied by hand. */
    url: string;
    status: CopyLinkStatus;
    onCopy: () => void;
    /** Already translated. */
    labels: { copy: string; copied: string; failed: string };
    /** Extra attributes for the button, such as analytics `track(...)`. */
    buttonProps?: Record<string, string>;
}

/** Copies a link, and says so in a live region. No logic: it renders `status`. */
export function CopyLinkButton({
    url,
    status,
    onCopy,
    labels,
    buttonProps,
}: CopyLinkButtonProps) {
    return (
        <div className="flex flex-col items-start gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCopy}
                {...buttonProps}
            >
                {status === 'copied' ? (
                    <CheckIcon aria-hidden />
                ) : (
                    <LinkIcon aria-hidden />
                )}
                {labels.copy}
            </Button>
            <p role="status" className="text-sm">
                {status === 'copied' && labels.copied}
                {status === 'failed' && (
                    <>
                        {labels.failed}{' '}
                        <span className="font-mono break-all select-all">
                            {url}
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}
