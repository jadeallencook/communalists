'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
import { Field, FieldDescription, FieldLabel } from '@/components/atoms/field';
import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/utils';

export interface ReasonDialogProps {
    /** The button that opens it. */
    triggerLabel: string;
    /** Its accessible name when the label alone isn't enough ("Ban: Luis Hernández"). */
    triggerAriaLabel?: string;
    title: string;
    description: string;
    confirmLabel: string;
    /** Hidden form fields (orgId, uid, action…). */
    fields: Record<string, string>;
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Most allowed characters. */
    maxLength: number;
    /** Start open (Storybook). */
    defaultOpen?: boolean;
    /** Ask for a reason (default). False makes it a plain confirmation. */
    withReason?: boolean;
    /** Red confirm button (default), for removing and banning. */
    destructive?: boolean;
    /** Replaces the hint under the reason (who sees it), e.g. for super users' admin log. */
    reasonHint?: string;
}

/**
 * Confirms a moderation action. Removing, banning and blocking need a written
 * reason, required here and on the server, kept in the group's moderation log
 * and seen by owners and moderators only. `withReason={false}` just confirms
 * (making someone an owner).
 */
export function ReasonDialog({
    triggerLabel,
    triggerAriaLabel,
    title,
    description,
    confirmLabel,
    fields,
    formAction,
    pending = false,
    maxLength,
    defaultOpen,
    withReason = true,
    destructive = true,
    reasonHint,
}: ReasonDialogProps) {
    const t = useTranslations('Membership');
    const [open, setOpen] = useState(defaultOpen ?? false);
    const id = `reason-${Object.values(fields).join('-')}`;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Outlined so it reads as a button without relying on colour;
                    red outline for removing and banning. */}
                <Button
                    variant="outline"
                    size="sm"
                    aria-label={triggerAriaLabel}
                    className={cn(
                        destructive &&
                            'border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive'
                    )}
                >
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form
                    action={(formData) => {
                        formAction(formData);
                        setOpen(false);
                    }}
                    className="contents"
                >
                    {Object.entries(fields).map(([name, value]) => (
                        <input
                            key={name}
                            type="hidden"
                            name={name}
                            value={value}
                        />
                    ))}
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {withReason && (
                        <Field>
                            <FieldLabel htmlFor={id}>{t('reason')}</FieldLabel>
                            <Textarea
                                id={id}
                                name="reason"
                                required
                                maxLength={maxLength}
                                rows={3}
                            />
                            <FieldDescription>
                                {reasonHint ?? t('reasonHint')}
                            </FieldDescription>
                        </Field>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                {t('back')}
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            variant={destructive ? 'destructive' : 'default'}
                            disabled={pending}
                        >
                            {confirmLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
