'use client';

import {
    CheckIcon,
    ChevronDownIcon,
    UserMinusIcon,
    UserPlusIcon,
    XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import type { ComradeState } from '@/lib/comrades';

export type ComradeButtonState = ComradeState | 'signedOut';

export interface ComradeButtonProps {
    state: ComradeButtonState;
    /** The other person. */
    uid: string;
    name: string;
    /** This page's path, to come back to after signing in. */
    next: string;
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** In the app, comradeAction via useActionState. Reads `uid` and `intent`. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated confirmation of the last action. */
    notice?: string;
    /** Already translated. */
    error?: string;
    /** Whether they're comrades couldn't be loaded: a message, no button. */
    loadFailed?: boolean;
    /** The "Remove comrade?" dialog is open. */
    confirmingRemove?: boolean;
    onConfirmingRemoveChange?: (open: boolean) => void;
    /** Changes after each action: focus goes back to the main control. */
    focusKey?: number;
}

/**
 * The comrade action in a profile's header, beside the name (full width on
 * phones). Add comrade; then "Request sent" or "Comrades", each a menu
 * holding Cancel request or Remove comrade (which asks in a dialog first).
 * A request from them shows as a strip under the name with Accept and
 * Decline, since it needs an answer. Results are announced; buttons are
 * never `disabled` while saving (`aria-disabled`), so focus stays put.
 * Renders flex items for ProfileCard's header. No logic: `state` decides.
 */
export function ComradeButton({
    state,
    uid,
    name,
    next,
    locale,
    formAction,
    pending = false,
    notice,
    error,
    loadFailed = false,
    confirmingRemove = false,
    onConfirmingRemoveChange = () => {},
    focusKey,
}: ComradeButtonProps) {
    const t = useTranslations('Comrades');
    const formId = useId();
    const mainRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
    useEffect(() => {
        if (focusKey) mainRef.current?.focus();
    }, [focusKey]);

    const busy = {
        'aria-disabled': pending,
        onClick: (e: React.MouseEvent) => {
            if (pending) e.preventDefault();
        },
    };
    const fields = (
        <>
            <input type="hidden" name="uid" value={uid} />
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="locale" value={locale} />
        </>
    );
    // Phones: the full width under the name. Wider: beside it.
    const slot = 'w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto';

    let control = null;
    let strip = null;
    if (loadFailed) {
        strip = (
            <p className="basis-full text-sm text-muted-foreground">
                {t('loadFailed')}
            </p>
        );
    } else if (state === 'signedOut') {
        control = (
            <Button asChild>
                <Link
                    ref={mainRef}
                    href={{ pathname: '/sign-in', query: { next } }}
                    {...track('comrade-sign-in', { from: 'profile' })}
                >
                    <UserPlusIcon aria-hidden />
                    {t('signIn')}
                </Link>
            </Button>
        );
    } else if (state === 'none') {
        control = (
            <Button
                ref={mainRef}
                type="submit"
                form={formId}
                name="intent"
                value="request"
                {...busy}
                {...track('comrade-request', { from: 'profile' })}
            >
                <UserPlusIcon aria-hidden />
                {t('add')}
            </Button>
        );
    } else if (state === 'sent' || state === 'comrades') {
        const sent = state === 'sent';
        control = (
            // Not modal, so opening the dialog from it keeps focus in the dialog.
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button ref={mainRef} variant="outline" {...busy}>
                        <CheckIcon aria-hidden />
                        {sent ? t('sent') : t('comrades')}
                        <ChevronDownIcon aria-hidden />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                    {sent ? (
                        <DropdownMenuItem asChild>
                            <button
                                type="submit"
                                form={formId}
                                name="intent"
                                value="cancel"
                                className="w-full"
                                {...track('comrade-cancel', {
                                    from: 'profile',
                                })}
                            >
                                <XIcon aria-hidden />
                                {t('cancel')}
                            </button>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onConfirmingRemoveChange(true)}
                        >
                            <UserMinusIcon aria-hidden />
                            {t('remove')}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    } else {
        // They asked: it needs an answer, so it stands out under the name.
        strip = (
            <div className="flex basis-full flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
                <p className="text-sm font-medium">{t('received', { name })}</p>
                <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                        ref={mainRef}
                        type="submit"
                        form={formId}
                        name="intent"
                        value="accept"
                        className="flex-1 sm:flex-none"
                        {...busy}
                        {...track('comrade-accept', { from: 'profile' })}
                    >
                        {t('accept')}
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        name="intent"
                        value="decline"
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        {...busy}
                        {...track('comrade-decline', { from: 'profile' })}
                    >
                        {t('decline')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* The buttons above (and in the menu, which is rendered
                elsewhere) submit this form through their `form` attribute. */}
            <form id={formId} action={formAction} hidden>
                {fields}
            </form>
            {control && <div className={slot}>{control}</div>}
            {strip}
            <Dialog
                open={state === 'comrades' && confirmingRemove}
                onOpenChange={onConfirmingRemoveChange}
            >
                <DialogContent
                    showCloseButton={false}
                    onCloseAutoFocus={(e) => {
                        // Back to the Comrades menu (or Add comrade, once removed).
                        e.preventDefault();
                        mainRef.current?.focus();
                    }}
                >
                    <form action={formAction} className="contents">
                        {fields}
                        <DialogHeader>
                            <DialogTitle>
                                {t('removeTitle', { name })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('removeConfirm')}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    {t('removeNo')}
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                name="intent"
                                value="remove"
                                variant="destructive"
                                {...busy}
                                {...track('comrade-remove', {
                                    from: 'profile',
                                })}
                            >
                                {t('removeYes')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <p
                role="status"
                className="basis-full text-sm text-muted-foreground empty:hidden"
            >
                {notice}
            </p>
            {error && (
                <p role="alert" className="basis-full text-sm text-destructive">
                    {error}
                </p>
            )}
        </>
    );
}
