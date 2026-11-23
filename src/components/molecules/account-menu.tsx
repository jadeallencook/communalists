import { LayoutDashboardIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { initials } from '@/lib/initials';

export interface AccountMenuProps {
    name: string;
    email?: string;
    /** Sent with sign-out so the redirect stays in this language. */
    locale: string;
    /** In the app, the signOut server action. */
    signOutAction: (formData: FormData) => void | Promise<void>;
}

/** The signed-in user's menu: initials button → name, Dashboard (phones), Account settings, Sign out. */
export function AccountMenu({
    name,
    email,
    locale,
    signOutAction,
}: AccountMenuProps) {
    const t = useTranslations('AccountMenu');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label={t('open', { name })}
                >
                    <span
                        aria-hidden
                        className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                    >
                        {initials(name)}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate">{name}</span>
                    {email && (
                        <span className="truncate text-xs font-normal text-muted-foreground">
                            {email}
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* On wider screens Dashboard is a link in the header instead. */}
                <DropdownMenuItem asChild className="sm:hidden">
                    <Link href="/dashboard">
                        <LayoutDashboardIcon aria-hidden />
                        {t('dashboard')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/settings">
                        <SettingsIcon aria-hidden />
                        {t('settings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <DropdownMenuItem asChild>
                        <button type="submit" className="w-full">
                            <LogOutIcon aria-hidden />
                            {t('signOut')}
                        </button>
                    </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
