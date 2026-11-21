import { LinkIcon, TimerOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import type { LinkProblem as Reason } from '@/lib/validation/reset-password';

export interface LinkProblemProps {
    /** `expired`: used or past its hour. `invalid`: incomplete, or a kind of link we don't handle. */
    reason: Reason;
}

/** Explains why an emailed link can't be used and offers a fresh one. */
export function LinkProblem({ reason }: LinkProblemProps) {
    const t = useTranslations('LinkProblem');
    const Icon = reason === 'expired' ? TimerOffIcon : LinkIcon;

    return (
        <div role="alert" className="flex flex-col items-start gap-3">
            <Icon aria-hidden className="size-6" />
            <p className="font-medium">{t(`${reason}.title`)}</p>
            <p className="text-sm text-muted-foreground">
                {t(`${reason}.body`)}
            </p>
            <Button asChild>
                <Link href="/forgot-password">{t('requestNew')}</Link>
            </Button>
        </div>
    );
}
