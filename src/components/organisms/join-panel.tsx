import { BanIcon, ClockIcon, LockIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import { Link } from '@/i18n/navigation';
import type { JoinState } from '@/lib/organizations/membership';

export interface JoinPanelProps {
    state: JoinState;
    orgId: string;
    handle: string;
    name: string;
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** In the app, membershipAction via useActionState. Reads `intent`: join, cancel or leave. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated. */
    error?: string;
    /** Already translated confirmation of the last action ("You're in"). */
    notice?: string;
}

/**
 * The join area on a group's page: Join, Ask to join, the pending request,
 * or why they can't (stacked, for the card at the top of the page's side
 * column), and Leave for members (in their space). No logic: `state` decides.
 */
export function JoinPanel({
    state,
    orgId,
    handle,
    name,
    locale,
    formAction,
    pending = false,
    error,
    notice,
}: JoinPanelProps) {
    const t = useTranslations('Membership');
    const hidden = (intent: string) => (
        <>
            <input type="hidden" name="orgId" value={orgId} />
            <input type="hidden" name="handle" value={handle} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="intent" value={intent} />
        </>
    );
    const note = (icon: React.ReactNode, text: string) => (
        <p className="flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
            {icon}
            {text}
        </p>
    );

    let body: React.ReactNode;
    switch (state) {
        case 'signedOut':
            body = (
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/sign-in">{t('signInToJoin')}</Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t('signInHint')}
                    </span>
                </div>
            );
            break;
        case 'join':
        case 'request':
            body = (
                <form action={formAction} className="flex flex-col gap-2">
                    {hidden('join')}
                    <Button type="submit" disabled={pending} className="w-full">
                        {state === 'join' ? t('join') : t('askToJoin')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {state === 'join' ? t('joinHint') : t('askHint')}
                    </span>
                </form>
            );
            break;
        case 'pending':
            body = (
                <form action={formAction} className="flex flex-col gap-3">
                    {hidden('cancel')}
                    {note(<ClockIcon aria-hidden />, t('pending'))}
                    <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        className="w-full"
                    >
                        {t('cancelRequest')}
                    </Button>
                </form>
            );
            break;
        case 'inviteOnly':
            body = note(<LockIcon aria-hidden />, t('inviteOnly'));
            break;
        case 'banned':
            body = note(<BanIcon aria-hidden />, t('banned'));
            break;
        case 'member':
            body = (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="self-start"
                        >
                            {t('leave')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form action={formAction} className="contents">
                            {hidden('leave')}
                            <DialogHeader>
                                <DialogTitle>
                                    {t('leaveTitle', { name })}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('leaveBody')}
                                </DialogDescription>
                            </DialogHeader>
                            {error && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {error}
                                </p>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        {t('keep')}
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={pending}
                                >
                                    {t('leaveConfirm')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            );
            break;
    }

    return (
        <div className="flex flex-col gap-2">
            {body}
            {notice && (
                <p role="status" className="text-sm text-muted-foreground">
                    {notice}
                </p>
            )}
            {error && state !== 'member' && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
