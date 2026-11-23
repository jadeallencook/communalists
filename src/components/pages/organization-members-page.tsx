import { ArrowLeftIcon, InboxIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { ReasonDialog } from '@/components/molecules/reason-dialog';
import { Link } from '@/i18n/navigation';
import { initials } from '@/lib/initials';
import { ORG_EDIT_FIELDS, type OrgEditField } from '@/lib/organizations/edit';
import {
    REASON_MAX_LENGTH,
    type ModerationAction,
    type OrgRole,
    type RoleChange,
} from '@/lib/organizations/membership';
import { cn } from '@/lib/utils';

interface Person {
    uid: string;
    displayName: string;
    /** Epoch ms: asked, joined or banned. */
    since?: number;
}

export interface OrganizationMembersPageProps {
    orgId: string;
    name: string;
    handle: string;
    locale: string;
    requests: Person[];
    /**
     * Active members, owners first. `canAct`: the viewer may remove or ban
     * them. `roleChanges`: the role changes the viewer may make.
     */
    members: (Person & {
        role: OrgRole;
        canAct: boolean;
        roleChanges: RoleChange[];
    })[];
    banned: (Person & { reason?: string })[];
    log: {
        id: string;
        action: ModerationAction | 'editProfile';
        /** editProfile only: which fields changed. */
        fields?: string[];
        actorName: string;
        targetName: string;
        reason?: string;
        at?: number;
    }[];
    /** In the app, moderateAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated. */
    error?: string;
    notice?: string;
}

/** /org/{handle}/members, for owners and moderators: requests, members, bans and the log. */
export function OrganizationMembersPage({
    orgId,
    name,
    handle,
    locale,
    requests,
    members,
    banned,
    log,
    formAction,
    pending = false,
    error,
    notice,
}: OrganizationMembersPageProps) {
    const t = useTranslations('Membership');
    const format = useFormatter();
    const date = (at?: number) =>
        at ? format.dateTime(new Date(at), { dateStyle: 'medium' }) : '';
    const fields = (uid: string, action: ModerationAction) => ({
        orgId,
        uid,
        action,
        locale,
    });
    // Every button has a border (not just colour) so it reads as a button,
    // and a name that says who it's for: "Remove: Luis Hernández".
    const forPerson = (action: string, person: Person) =>
        t('actionFor', { action, name: person.displayName });
    const quick = (
        person: Person,
        action: ModerationAction,
        label: string,
        variant: 'default' | 'outline' = 'outline'
    ) => (
        <form action={formAction}>
            {Object.entries(fields(person.uid, action)).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
            ))}
            <Button
                type="submit"
                size="sm"
                variant={variant}
                disabled={pending}
                aria-label={forPerson(label, person)}
            >
                {label}
            </Button>
        </form>
    );
    const reason = (
        person: Person,
        action: 'remove' | 'ban' | 'block',
        triggerLabel: string
    ) => (
        <ReasonDialog
            triggerLabel={triggerLabel}
            triggerAriaLabel={forPerson(triggerLabel, person)}
            title={t(`${action}Title`, { name: person.displayName })}
            description={t(`${action}Body`)}
            confirmLabel={t(`${action}Confirm`)}
            fields={fields(person.uid, action)}
            formAction={formAction}
            pending={pending}
            maxLength={REASON_MAX_LENGTH}
        />
    );

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="self-start"
                >
                    <Link href={`/org/${handle}`}>
                        <ArrowLeftIcon aria-hidden />
                        {name}
                    </Link>
                </Button>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('manageTitle')}
                </h1>
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
                {notice && !error && (
                    <p role="status" className="text-sm text-muted-foreground">
                        {notice}
                    </p>
                )}
            </header>

            <Section title={t('requestsTitle')} count={requests.length}>
                {requests.length === 0 ? (
                    <Empty icon={<InboxIcon />} text={t('noRequests')} />
                ) : (
                    requests.map((person) => (
                        <Row
                            key={person.uid}
                            person={person}
                            detail={t('askedOn', { date: date(person.since) })}
                        >
                            {quick(person, 'approve', t('approve'), 'default')}
                            {quick(person, 'deny', t('deny'))}
                            {reason(person, 'block', t('block'))}
                        </Row>
                    ))
                )}
            </Section>

            <Section title={t('membersTitle')} count={members.length}>
                {members.map((person) => (
                    <Row
                        key={person.uid}
                        person={person}
                        badge={
                            person.role === 'member'
                                ? undefined
                                : t(`roles.${person.role}`)
                        }
                        detail={t('joinedOn', { date: date(person.since) })}
                    >
                        {person.roleChanges.map((change) =>
                            change === 'makeOwner' ? (
                                <ReasonDialog
                                    key={change}
                                    triggerLabel={t('makeOwner')}
                                    triggerAriaLabel={forPerson(
                                        t('makeOwner'),
                                        person
                                    )}
                                    title={t('makeOwnerTitle', {
                                        name: person.displayName,
                                    })}
                                    description={t('makeOwnerBody')}
                                    confirmLabel={t('makeOwner')}
                                    fields={fields(person.uid, change)}
                                    formAction={formAction}
                                    pending={pending}
                                    maxLength={REASON_MAX_LENGTH}
                                    withReason={false}
                                    destructive={false}
                                />
                            ) : (
                                <span key={change}>
                                    {quick(person, change, t(change))}
                                </span>
                            )
                        )}
                        {person.canAct && (
                            <>
                                {reason(person, 'remove', t('remove'))}
                                {reason(person, 'ban', t('ban'))}
                            </>
                        )}
                    </Row>
                ))}
            </Section>

            <Section title={t('bannedTitle')} count={banned.length}>
                {banned.length === 0 ? (
                    <Empty text={t('noBans')} />
                ) : (
                    banned.map((person) => (
                        <Row
                            key={person.uid}
                            person={person}
                            detail={
                                person.reason
                                    ? t('bannedOnWithReason', {
                                          date: date(person.since),
                                          reason: person.reason,
                                      })
                                    : t('bannedOn', {
                                          date: date(person.since),
                                      })
                            }
                        >
                            {quick(person, 'unban', t('unban'))}
                        </Row>
                    ))
                )}
            </Section>

            <Section title={t('logTitle')}>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('logHint')}
                </p>
                {log.length === 0 ? (
                    <Empty text={t('noLog')} />
                ) : (
                    <ol className="flex flex-col divide-y rounded-lg border">
                        {log.map((entry) => (
                            <li
                                key={entry.id}
                                className="flex flex-col gap-0.5 p-3 text-sm"
                            >
                                <span>
                                    {entry.action === 'editProfile'
                                        ? t('log.editProfile', {
                                              actor: entry.actorName,
                                              fields: format.list(
                                                  (entry.fields ?? [])
                                                      .filter((f) =>
                                                          (
                                                              ORG_EDIT_FIELDS as readonly string[]
                                                          ).includes(f)
                                                      )
                                                      .map((f) =>
                                                          t(
                                                              `fields.${f as OrgEditField}`
                                                          )
                                                      ),
                                                  { type: 'conjunction' }
                                              ),
                                          })
                                        : t(`log.${entry.action}`, {
                                              actor: entry.actorName,
                                              target: entry.targetName,
                                          })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {date(entry.at)}
                                    {entry.reason
                                        ? ` · ${t('reasonQuoted', { reason: entry.reason })}`
                                        : ''}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </Section>
        </section>
    );
}

function Section({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">
                {title}
                {count !== undefined && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                        {count}
                    </span>
                )}
            </h2>
            {children}
        </div>
    );
}

function Row({
    person,
    badge,
    detail,
    children,
}: {
    person: Person;
    badge?: string;
    detail?: string;
    children?: ReactNode;
}) {
    // Stacked on narrow screens (name, then the buttons on their own lines),
    // side by side from md up. The name wraps rather than being cut off.
    return (
        <div className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                >
                    {initials(person.displayName)}
                </span>
                <span className="flex min-w-0 flex-col">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium break-words">
                            {person.displayName}
                        </span>
                        {badge && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">
                                {badge}
                            </span>
                        )}
                    </span>
                    {detail && (
                        <span className="text-sm break-words text-muted-foreground">
                            {detail}
                        </span>
                    )}
                </span>
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
                    {children}
                </div>
            )}
        </div>
    );
}

function Empty({ icon, text }: { icon?: ReactNode; text: string }) {
    return (
        <p
            className={cn(
                'flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground',
                '[&_svg]:size-5 [&_svg]:shrink-0'
            )}
        >
            {icon && <span aria-hidden>{icon}</span>}
            {text}
        </p>
    );
}

/** Shown while the members page loads. */
export function OrganizationMembersPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-9 w-56" />
            </div>
            {[2, 4, 1].map((rows, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="h-7 w-40" />
                    {Array.from({ length: rows }, (_, j) => (
                        <Skeleton
                            key={j}
                            className="h-[62px] w-full rounded-lg"
                        />
                    ))}
                </div>
            ))}
        </section>
    );
}
