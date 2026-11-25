import { Trash2Icon } from 'lucide-react';
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
import { Field, FieldLabel } from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';

export interface DeleteOrganizationSectionProps {
    name: string;
    orgId: string;
    /** UI locale, sent so the redirect stays in it. */
    locale: string;
    /** What's typed in the confirmation box (controlled). */
    typed: string;
    onTypedChange: (typed: string) => void;
    /** Whether `typed` matches the name; from deleteConfirmed, in the container. */
    confirmed: boolean;
    /** In the app, deleteOrganizationAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated. */
    error?: string;
}

/**
 * At the end of the edit page, for owners: delete the organization, after
 * typing its name. Says what happens first. No logic: `confirmed` decides.
 */
export function DeleteOrganizationSection({
    name,
    orgId,
    locale,
    typed,
    onTypedChange,
    confirmed,
    formAction,
    pending = false,
    error,
}: DeleteOrganizationSectionProps) {
    const t = useTranslations('Organizations.delete');
    return (
        <section
            aria-labelledby="delete-organization"
            className="flex flex-col items-start gap-3 rounded-lg border border-destructive/50 p-5"
        >
            <h2
                id="delete-organization"
                className="font-heading text-lg font-semibold"
            >
                {t('title')}
            </h2>
            <p className="text-sm text-pretty">{t('body')}</p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive"
                    >
                        <Trash2Icon aria-hidden />
                        {t('button')}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={formAction} className="contents">
                        <input type="hidden" name="orgId" value={orgId} />
                        <input type="hidden" name="uiLocale" value={locale} />
                        <DialogHeader>
                            <DialogTitle>
                                {t('confirmTitle', { name })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('confirmBody')}
                            </DialogDescription>
                        </DialogHeader>
                        <Field>
                            <FieldLabel htmlFor="confirmName">
                                {t('typeName', { name })}
                            </FieldLabel>
                            <Input
                                id="confirmName"
                                name="confirmName"
                                value={typed}
                                onChange={(event) =>
                                    onTypedChange(event.target.value)
                                }
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </Field>
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
                                disabled={!confirmed || pending}
                            >
                                {pending ? t('deleting') : t('confirm')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
