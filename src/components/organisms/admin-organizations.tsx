'use client';

import { DownloadIcon, PlusIcon, SearchIcon, UploadIcon } from 'lucide-react';
import Form from 'next/form';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Link } from '@/i18n/navigation';
import { DETAIL_GAPS, type DetailGap } from '@/lib/organizations/details';
import { cn } from '@/lib/utils';

export interface AdminOrganizationItem {
    id: string;
    name: string;
    handle: string;
    place: string;
    unclaimed: boolean;
    archived: boolean;
    /** Already formatted. */
    addedOn?: string;
    missingDetails: DetailGap[];
}

export interface AdminOrganizationsProps {
    /** What was searched for; undefined when nothing was. */
    query?: string;
    /** Results for `query` (at most `searchLimit`). */
    results?: AdminOrganizationItem[];
    searchLimit: number;
    /** The missing detail being listed. */
    gap: DetailGap;
    /** Active unclaimed organizations missing each detail. */
    gapCounts: Record<DetailGap, number>;
    /** The first of them, oldest first. */
    missing: AdminOrganizationItem[];
    recent: AdminOrganizationItem[];
}

/**
 * The super user's organization tools: add, import, download, search, the
 * unclaimed pages missing details, and the newest organizations. Search and
 * the filter are plain GET links and forms, so they work before scripts load.
 */
export function AdminOrganizations({
    query,
    results,
    searchLimit,
    gap,
    gapCounts,
    missing,
    recent,
}: AdminOrganizationsProps) {
    const t = useTranslations('Admin');
    const locale = useLocale();
    const searched = query !== undefined && results !== undefined;

    return (
        <section
            aria-labelledby="admin-organizations"
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-3">
                <h2
                    id="admin-organizations"
                    className="font-heading text-xl font-semibold"
                >
                    {t('sections.organizations')}
                </h2>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('organizationsHint')}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link
                            href={{
                                pathname: '/org/new',
                                query: { unclaimed: '1' },
                            }}
                        >
                            <PlusIcon aria-hidden />
                            {t('addUnclaimed')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/import">
                            <UploadIcon aria-hidden />
                            {t('importUnclaimed')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        {/* A file download, not a page: a plain link. */}
                        <a href="/api/admin/organizations" download>
                            <DownloadIcon aria-hidden />
                            {t('downloadExisting')}
                        </a>
                    </Button>
                </div>
            </div>

            <div id="search" className="flex flex-col gap-3">
                <Form
                    action={`/${locale}/admin`}
                    scroll={false}
                    role="search"
                    className="flex flex-col gap-2"
                >
                    <label
                        htmlFor="admin-search"
                        className="text-sm font-medium"
                    >
                        {t('searchLabel')}
                    </label>
                    <p
                        id="admin-search-hint"
                        className="text-sm text-muted-foreground"
                    >
                        {t('searchHint')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            id="admin-search"
                            name="q"
                            type="search"
                            defaultValue={query}
                            maxLength={60}
                            autoComplete="off"
                            aria-describedby="admin-search-hint"
                            className="min-w-0 flex-1 basis-56"
                        />
                        {/* Keep the chosen filter while searching. */}
                        <input type="hidden" name="gap" value={gap} />
                        <Button type="submit" variant="outline">
                            <SearchIcon aria-hidden />
                            {t('searchButton')}
                        </Button>
                    </div>
                </Form>
                {/* Always in the page, so a new result is announced. */}
                <div role="status" className="text-sm">
                    {searched &&
                        t('searchResults', {
                            count: results.length,
                            query,
                        })}
                    {searched && results.length >= searchLimit && (
                        <> {t('searchMore', { count: searchLimit })}</>
                    )}
                </div>
                {searched && (
                    <>
                        {results.length > 0 && (
                            <OrganizationList items={results} />
                        )}
                        <Button asChild variant="link" className="w-fit px-0">
                            <Link
                                href={{ pathname: '/admin', query: { gap } }}
                                scroll={false}
                            >
                                {t('clearSearch')}
                            </Link>
                        </Button>
                    </>
                )}
            </div>

            <section
                id="gaps"
                aria-labelledby="admin-gaps"
                className="flex flex-col gap-3"
            >
                <h3
                    id="admin-gaps"
                    className="font-heading text-lg font-semibold"
                >
                    {t('gapsTitle')}
                </h3>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('gapsHint')}
                </p>
                <nav aria-label={t('gapsFilter')}>
                    <ul className="flex flex-wrap gap-2">
                        {DETAIL_GAPS.map((key) => (
                            <li key={key}>
                                <Link
                                    href={{
                                        pathname: '/admin',
                                        query: {
                                            ...(query ? { q: query } : {}),
                                            gap: key,
                                        },
                                    }}
                                    scroll={false}
                                    aria-current={
                                        key === gap ? 'true' : undefined
                                    }
                                    className={cn(
                                        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        key === gap
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'hover:bg-muted'
                                    )}
                                >
                                    {t(`gaps.${key}`)}
                                    <span className="tabular-nums">
                                        ({gapCounts[key]})
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                {missing.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('noGaps')}
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {t('gapsShowing', {
                                shown: missing.length,
                                count: gapCounts[gap],
                            })}
                        </p>
                        <OrganizationList items={missing} />
                    </>
                )}
            </section>

            <section
                aria-labelledby="admin-recent"
                className="flex flex-col gap-3"
            >
                <h3
                    id="admin-recent"
                    className="font-heading text-lg font-semibold"
                >
                    {t('recentTitle')}
                </h3>
                {recent.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('noRecent')}
                    </p>
                ) : (
                    <OrganizationList items={recent} />
                )}
            </section>
        </section>
    );
}

function OrganizationList({ items }: { items: AdminOrganizationItem[] }) {
    const t = useTranslations('Admin');
    const gapNames = useTranslations('Admin.gapNames');
    const locale = useLocale();
    const list = new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
    });
    return (
        <ul className="flex flex-col divide-y rounded-lg border">
            {items.map((org) => {
                const editable = org.unclaimed && !org.archived;
                // "contact" only sums up phone, email and website (and socials).
                const gaps = org.missingDetails.filter(
                    (g): g is Exclude<DetailGap, 'contact'> => g !== 'contact'
                );
                return (
                    <li
                        key={org.id}
                        className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between"
                    >
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                {org.archived ? (
                                    <span className="font-medium break-words">
                                        {org.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={`/org/${org.handle}`}
                                        className="font-medium break-words underline underline-offset-2"
                                    >
                                        {org.name}
                                    </Link>
                                )}
                                {org.unclaimed && (
                                    <span className="rounded-full border px-2.5 py-0.5 text-xs">
                                        {t('statusUnclaimed')}
                                    </span>
                                )}
                                {org.archived && (
                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                                        {t('statusDeleted')}
                                    </span>
                                )}
                            </span>
                            <span className="text-sm break-words text-muted-foreground">
                                {[
                                    org.place,
                                    `/org/${org.handle}`,
                                    org.addedOn &&
                                        t('addedOn', { date: org.addedOn }),
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </span>
                            {editable && gaps.length > 0 && (
                                <span className="text-sm">
                                    {t('missingList', {
                                        list: list.format(
                                            gaps.map((g) => gapNames(g))
                                        ),
                                    })}
                                </span>
                            )}
                        </span>
                        {editable && (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="w-fit shrink-0"
                            >
                                <Link
                                    href={`/org/${org.handle}/edit`}
                                    aria-label={t('editFor', {
                                        name: org.name,
                                    })}
                                >
                                    {t('edit')}
                                </Link>
                            </Button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
