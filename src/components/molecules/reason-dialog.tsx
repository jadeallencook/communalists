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

export interface ReasonDialogProps {
    /** The button that opens it. */
    triggerLabel: string;
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
}

/**
 * A destructive action that needs a written reason (remove, ban, block).
 * The reason is required here and on the server; it's kept in the group's
 * moderation log, seen by owners and moderators only.
 */
export function ReasonDialog({
    triggerLabel,
    title,
    description,
    confirmLabel,
    fields,
    formAction,
    pending = false,
    maxLength,
    defaultOpen,
}: ReasonDialogProps) {
    const t = useTranslations('Membership');
    const [open, setOpen] = useState(defaultOpen ?? false);
    const id = `reason-${Object.values(fields).join('-')}`;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
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
                    <Field>
                        <FieldLabel htmlFor={id}>{t('reason')}</FieldLabel>
                        <Textarea
                            id={id}
                            name="reason"
                            required
                            maxLength={maxLength}
                            rows={3}
                        />
                        <FieldDescription>{t('reasonHint')}</FieldDescription>
                    </Field>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                {t('back')}
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            variant="destructive"
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
