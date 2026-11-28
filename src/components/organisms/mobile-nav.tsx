'use client';

import {
    BookOpenIcon,
    LayoutDashboardIcon,
    LogOutIcon,
    MenuIcon,
    SearchIcon,
    SettingsIcon,
    ShieldIcon,
    UserIcon,
    UsersRoundIcon,
    type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Separator } from '@/components/atoms/separator';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/atoms/sheet';
import type { MenuOrganization } from '@/components/molecules/account-menu';
import type { NavLinkData } from '@/components/molecules/header-links';
import { ThemeOptions } from '@/components/molecules/theme-toggle';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import type { NavKey } from '@/lib/navigation';
import { organizationPath } from '@/lib/paths';

const ICONS: Record<NavKey, LucideIcon> = {
    organizations: SearchIcon,
    dictionary: BookOpenIcon,
    dashboard: LayoutDashboardIcon,
};

/** What the drawer shows for a signed-in person. Same fields as AccountMenu. */
export interface MobileNavAccount {
    name: string;
    email?: string;
    locale: string;
    username?: string;
    organizations?: MenuOrganization[];
    moreOrganizations?: boolean;
    isAdmin?: boolean;
    signOutAction: (formData: FormData) => void | Promise<void>;
}

export interface MobileNavProps {
    /** The site's sections, with the current one marked. */
    links: NavLinkData[];
    /** Signed in: their account. Signed out: omit, and Sign in / Create account show. */
    account?: MobileNavAccount;
    /** Signed out: marks the auth page the visitor is on. */
    current?: 'sign-in' | 'sign-up';
    /** Starts open (Storybook). */
    defaultOpen?: boolean;
}

// Rows are at least 44px tall, for fingers. The current section gets a fill
// and an underline, so it isn't marked by colour alone.
const rowClass =
    'flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-base hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring aria-[current]:bg-muted aria-[current]:font-medium aria-[current]:underline aria-[current]:decoration-2 aria-[current]:underline-offset-4 [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground';

/**
 * Phones and narrow windows (below `lg`, which includes 200% zoom): a Menu
 * button that opens a drawer with every section, the person's organizations,
 * account links, theme and sign-out. The language switcher stays in the header
 * itself, so someone who can't read the current language can still find it.
 * A Radix dialog: focus moves in, Esc closes, focus returns to the button.
 */
export function MobileNav({
    links,
    account,
    current,
    defaultOpen,
}: MobileNavProps) {
    const t = useTranslations('Nav');
    const auth = useTranslations('HeaderLinks');
    const menu = useTranslations('AccountMenu');
    const header = useTranslations('Header');

    return (
        <Sheet defaultOpen={defaultOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    {...track('menu-open')}
                >
                    <MenuIcon aria-hidden className="size-5!" />
                    {t('menu')}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                closeLabel={t('closeMenu')}
                aria-describedby={undefined}
                className="w-[min(22rem,90vw)] gap-0 overflow-y-auto"
            >
                <SheetHeader className="border-b pe-12">
                    <SheetTitle className="text-lg">{t('menu')}</SheetTitle>
                    {account && (
                        <p className="flex min-w-0 flex-col text-sm">
                            <span className="truncate font-medium">
                                {account.name}
                            </span>
                            {account.email && (
                                <span className="truncate text-muted-foreground">
                                    {account.email}
                                </span>
                            )}
                        </p>
                    )}
                </SheetHeader>

                <div className="flex flex-col gap-4 p-4">
                    {!account && (
                        <div className="flex flex-col gap-2">
                            <SheetClose asChild>
                                <Button asChild>
                                    <Link
                                        href="/sign-up"
                                        aria-current={
                                            current === 'sign-up'
                                                ? 'page'
                                                : undefined
                                        }
                                        {...track('sign-up', {
                                            from: 'header',
                                        })}
                                    >
                                        {auth('createAccount')}
                                    </Link>
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button asChild variant="outline">
                                    <Link
                                        href="/sign-in"
                                        aria-current={
                                            current === 'sign-in'
                                                ? 'page'
                                                : undefined
                                        }
                                        {...track('sign-in', {
                                            from: 'header',
                                        })}
                                    >
                                        {auth('signIn')}
                                    </Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}

                    <nav aria-label={header('navigation')}>
                        <ul className="flex flex-col gap-1">
                            {links.map((link) => {
                                const Icon = ICONS[link.key];
                                return (
                                    <li key={link.key}>
                                        <SheetClose asChild>
                                            <Link
                                                href={link.href}
                                                aria-current={link.current}
                                                className={rowClass}
                                                {...track('nav-link', {
                                                    to: link.key,
                                                    from: 'menu',
                                                })}
                                            >
                                                <Icon aria-hidden />
                                                {t(link.key)}
                                            </Link>
                                        </SheetClose>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {account && account.organizations?.length ? (
                        <Section heading={t('yourOrganizations')}>
                            {account.organizations.map((org) => (
                                <li key={org.handle}>
                                    <SheetClose asChild>
                                        <Link
                                            href={organizationPath(org.handle)}
                                            className={rowClass}
                                        >
                                            <UsersRoundIcon aria-hidden />
                                            <span className="min-w-0 break-words">
                                                {org.name}
                                            </span>
                                        </Link>
                                    </SheetClose>
                                </li>
                            ))}
                            {account.moreOrganizations && (
                                <li>
                                    <SheetClose asChild>
                                        <Link
                                            href="/dashboard"
                                            className={`${rowClass} ps-11`}
                                        >
                                            {t('seeAllOrganizations')}
                                        </Link>
                                    </SheetClose>
                                </li>
                            )}
                        </Section>
                    ) : null}

                    {account && (
                        <Section heading={t('account')}>
                            {account.username && (
                                <li>
                                    <SheetClose asChild>
                                        <Link
                                            href={`/comrade/${account.username}`}
                                            className={rowClass}
                                        >
                                            <UserIcon aria-hidden />
                                            {menu('profile')}
                                        </Link>
                                    </SheetClose>
                                </li>
                            )}
                            <li>
                                <SheetClose asChild>
                                    <Link
                                        href="/account/settings"
                                        className={rowClass}
                                    >
                                        <SettingsIcon aria-hidden />
                                        {menu('settings')}
                                    </Link>
                                </SheetClose>
                            </li>
                            {account.isAdmin && (
                                <li>
                                    <SheetClose asChild>
                                        <Link
                                            href="/admin"
                                            className={rowClass}
                                        >
                                            <ShieldIcon aria-hidden />
                                            {t('admin')}
                                        </Link>
                                    </SheetClose>
                                </li>
                            )}
                        </Section>
                    )}

                    <Separator />
                    <ThemeOptions />

                    {account && (
                        <>
                            <Separator />
                            {/* Not a SheetClose: closing would remove the
                                form before it submits. The drawer is keyed by
                                session, so it resets after sign-out. */}
                            <form action={account.signOutAction}>
                                <input
                                    type="hidden"
                                    name="locale"
                                    value={account.locale}
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <LogOutIcon aria-hidden />
                                    {menu('signOut')}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function Section({
    heading,
    children,
}: {
    heading: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-1">
            <h3 className="px-3 text-xs text-muted-foreground">{heading}</h3>
            <ul className="flex flex-col gap-1">{children}</ul>
        </section>
    );
}
