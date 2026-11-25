import { PencilIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { ProfileCard } from '@/components/organisms/profile-card';
import { Link } from '@/i18n/navigation';
import type { ProfileView } from '@/lib/profiles';

export interface ProfilePageProps {
    view: ProfileView;
    /** Their own profile: they see all of it, plus a way to edit and preview. */
    isSelf?: boolean;
    /** Their own profile: a PhotoEditor (wired by the route) to change their photo. */
    photoEditor?: ReactNode;
}

/** /comrade/{username}: a person's profile, as this viewer may see it. */
export function ProfilePage({
    view,
    isSelf = false,
    photoEditor,
}: ProfilePageProps) {
    const t = useTranslations('Profile');
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            {isSelf && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4 text-sm">
                    <span className="text-muted-foreground">
                        {t('selfNote')}
                    </span>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/account/profile">
                            <PencilIcon aria-hidden />
                            {t('edit')}
                        </Link>
                    </Button>
                </div>
            )}
            <ProfileCard view={view} photoEditor={photoEditor} />
        </section>
    );
}

/** Shown while the profile loads. */
export function ProfilePageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
            <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-2/3" />
        </section>
    );
}
