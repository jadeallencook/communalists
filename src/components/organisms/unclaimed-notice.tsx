import { InfoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';

export interface UnclaimedNoticeProps {
    name: string;
    handle: string;
}

/**
 * On an unclaimed organization's page: who added it and why, that the
 * organization doesn't run it, and how the organization can claim it (or
 * ask for it to be taken down).
 */
export function UnclaimedNotice({ name, handle }: UnclaimedNoticeProps) {
    const t = useTranslations('Unclaimed');
    return (
        <section
            aria-labelledby="unclaimed-title"
            className="flex flex-col gap-3 rounded-lg border border-dashed p-5"
        >
            <h2
                id="unclaimed-title"
                className="flex items-center gap-2 font-heading text-lg font-semibold"
            >
                <InfoIcon aria-hidden className="size-4 shrink-0" />
                {t('title')}
            </h2>
            <p className="text-sm text-pretty">{t('body', { name })}</p>
            <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline">
                    <Link
                        href={`/org/${handle}/claim`}
                        {...track('org-claim', { org: handle })}
                    >
                        {t('claim')}
                    </Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                    {t('claimHint')}
                </span>
            </div>
        </section>
    );
}
