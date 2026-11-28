import { BellIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import { unreadBadge } from '@/lib/notifications';
import { NOTIFICATIONS_PATH } from '@/lib/paths';

export interface NotificationsBellProps {
    /** Unread notifications. */
    unread: number;
}

/**
 * The header's bell: a link to /notifications with the number of new ones.
 * The link's name says the count ("Notifications, 2 new"), so the badge
 * itself is hidden from screen readers.
 */
export function NotificationsBell({ unread }: NotificationsBellProps) {
    const t = useTranslations('Notifications');
    const badge = unreadBadge(unread);
    return (
        <Button asChild variant="ghost" size="icon" className="relative">
            <Link
                href={NOTIFICATIONS_PATH}
                aria-label={t('bell', { count: unread })}
            >
                <BellIcon aria-hidden />
                {badge && (
                    <span
                        aria-hidden
                        className="absolute -end-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[0.625rem] leading-4 font-semibold text-primary-foreground"
                    >
                        {badge}
                    </span>
                )}
            </Link>
        </Button>
    );
}
