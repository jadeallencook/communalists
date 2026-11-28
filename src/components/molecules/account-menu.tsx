import {
    LogOutIcon,
    SettingsIcon,
    ShieldIcon,
    UserIcon,
    UsersRoundIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Avatar } from '@/components/molecules/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { organizationPath } from '@/lib/paths';

/** An organization the person belongs to, as the menus list it. */
export interface MenuOrganization {
    name: string;
    handle: string;
}

export interface AccountMenuProps {
    name: string;
    email?: string;
    /** Sent with sign-out so the redirect stays in this language. */
    locale: string;
    /** Their profile address; adds "Your profile". Missing mid-setup. */
    username?: string;
    /** Their own photo's small link (initials without one). */
    photo?: string;
    /** Their organizations, already cut to the few the menu shows. */
    organizations?: MenuOrganization[];
    /** They belong to more than `organizations` lists: adds "See all" (the dashboard). */
    moreOrganizations?: boolean;
    /** Super users get a link to /admin. The server decides; this only shows it. */
    isAdmin?: boolean;
    /** In the app, the signOut server action. */
    signOutAction: (formData: FormData) => void | Promise<void>;
}

/**
 * The signed-in user's menu on wide screens: photo (or initials) button → name, their
 * organizations, profile, settings, Admin (super users), Sign out. Phones get
 * the same things in the menu drawer (MobileNav).
 */
export function AccountMenu({
    name,
    email,
    locale,
    signOutAction,
    username,
    photo,
    organizations = [],
    moreOrganizations = false,
    isAdmin = false,
}: AccountMenuProps) {
    const t = useTranslations('AccountMenu');
    const nav = useTranslations('Nav');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label={t('open', { name })}
                >
                    <Avatar
                        name={name}
                        photo={photo}
                        size={28}
                        tone="primary"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate">{name}</span>
                    {email && (
                        <span className="truncate text-xs font-normal text-muted-foreground">
                            {email}
                        </span>
                    )}
                </DropdownMenuLabel>
                {organizations.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                {nav('yourOrganizations')}
                            </DropdownMenuLabel>
                            {organizations.map((org) => (
                                <DropdownMenuItem key={org.handle} asChild>
                                    <Link href={organizationPath(org.handle)}>
                                        <UsersRoundIcon aria-hidden />
                                        <span className="truncate">
                                            {org.name}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                            {moreOrganizations && (
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">
                                        <span className="ps-6">
                                            {nav('seeAllOrganizations')}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                    </>
                )}
                <DropdownMenuSeparator />
                {username && (
                    <DropdownMenuItem asChild>
                        <Link href={`/comrade/${username}`}>
                            <UserIcon aria-hidden />
                            {t('profile')}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/account/settings">
                        <SettingsIcon aria-hidden />
                        {t('settings')}
                    </Link>
                </DropdownMenuItem>
                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <ShieldIcon aria-hidden />
                            {nav('admin')}
                        </Link>
                    </DropdownMenuItem>
                )}
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
