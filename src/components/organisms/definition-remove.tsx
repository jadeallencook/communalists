'use client';

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

export interface RemoveDefinitionState {
    error?: 'notFound' | 'notAllowed' | 'generic';
    /** Changes on every result. */
    at?: number;
}

export interface DefinitionRemoveProps {
    slug: string;
    /** The word, in the UI language. */
    word: string;
    /** UI locale, sent so the redirect stays in it. */
    locale: string;
    /** In the app, removeDefinitionAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    state: RemoveDefinitionState;
}

/**
 * The "Remove this word" section of a word's edit page: a button that opens
 * a confirmation saying what removing does. No logic: it renders the states.
 */
export function DefinitionRemove({
    slug,
    word,
    locale,
    formAction,
    pending = false,
    state,
}: DefinitionRemoveProps) {
    const t = useTranslations('AdminDefinitions.remove');
    return (
        <section
            aria-labelledby="remove-word"
            className="flex flex-col items-start gap-3 rounded-lg border border-destructive/50 p-5"
        >
            <h2 id="remove-word" className="font-heading text-lg font-semibold">
                {t('title')}
            </h2>
            <p className="text-sm text-pretty">{t('intro', { word })}</p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive"
                    >
                        <Trash2Icon aria-hidden />
                        {t('button', { word })}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={formAction} className="contents">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="slug" value={slug} />
                        <DialogHeader>
                            <DialogTitle>
                                {t('confirmTitle', { word })}
                            </DialogTitle>
                            <DialogDescription>
                                {t('confirmBody')}
                            </DialogDescription>
                        </DialogHeader>
                        {state.error && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {t(`errors.${state.error}`)}
                            </p>
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    {t('notYet')}
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={pending}
                            >
                                {pending
                                    ? t('removing')
                                    : t('button', { word })}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
