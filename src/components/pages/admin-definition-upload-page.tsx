'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

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
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { definitionFieldName } from '@/components/organisms/definition-form';
import { Link } from '@/i18n/navigation';
import { limitFor } from '@/lib/definitions';
import { columnOf } from '@/lib/definitions/import';
import type {
    CheckedDefinitionUpdate,
    DefinitionUpdateFileProblem,
} from '@/lib/definitions/update';

export interface CheckDefinitionUpdateState {
    fileName?: string;
    /** The file as read, sent back so "Update" can send it again. */
    text?: string;
    /** The check, without the text to save (that stays on the server). */
    result?: Omit<CheckedDefinitionUpdate, 'text'> & { text?: undefined };
    ignoredColumns?: string[];
    /** When the word was last saved, as checked; null if never recorded. */
    updatedAt?: number | null;
    fileProblem?:
        | DefinitionUpdateFileProblem
        | 'tooBig'
        | 'noFile'
        | 'notAllowed'
        | 'generic';
    /** Missing columns, for `missingColumns`. */
    columns?: string[];
    /** Changes on every result, so focus moves to it each time. */
    at?: number;
}

export interface SaveDefinitionUpdateState {
    error?: 'changed' | 'notAllowed' | 'generic';
    at?: number;
}

export interface AdminDefinitionUploadPageProps {
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** In the app, checkDefinitionUpdateAction via useActionState. */
    checkAction: (formData: FormData) => void;
    checkPending?: boolean;
    check: CheckDefinitionUpdateState;
    /** In the app, saveDefinitionUpdateAction via useActionState. */
    saveAction: (formData: FormData) => void;
    savePending?: boolean;
    save: SaveDefinitionUpdateState;
}

/**
 * /admin/definitions/upload, for super users: upload one word's file, see
 * each field that changes (now and new), then update it. Related words are
 * never changed. No logic: it renders the states.
 */
export function AdminDefinitionUploadPage({
    locale,
    checkAction,
    checkPending = false,
    check,
    saveAction,
    savePending = false,
    save,
}: AdminDefinitionUploadPageProps) {
    const t = useTranslations('AdminDefinitions');
    const tu = useTranslations('AdminDefinitions.upload');
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (check.at || save.at) resultRef.current?.focus();
    }, [check.at, save.at]);

    const result = check.result;
    const file = check.fileName ?? '';

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin/definitions"
                    className="inline-flex w-fit items-center gap-1 text-sm underline underline-offset-4"
                >
                    <ArrowLeftIcon aria-hidden className="size-4" />
                    {t('backToList')}
                </Link>
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {tu('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {tu('intro')}
                </p>
            </header>

            <section
                aria-labelledby="upload-format"
                className="flex flex-col gap-2"
            >
                <h2
                    id="upload-format"
                    className="font-heading text-xl font-semibold"
                >
                    {tu('formatTitle')}
                </h2>
                <ul className="ml-5 list-disc text-sm text-pretty">
                    <li>{tu('formatOneRow')}</li>
                    <li>{tu('formatSlug')}</li>
                    <li>{tu('formatRelated')}</li>
                </ul>
            </section>

            <form
                action={checkAction}
                className="flex flex-col gap-3 rounded-lg border p-4"
            >
                <input type="hidden" name="locale" value={locale} />
                <Label htmlFor="definition-file">{tu('file')}</Label>
                <Input
                    id="definition-file"
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    required
                    aria-describedby="definition-file-hint"
                />
                <p
                    id="definition-file-hint"
                    className="text-sm text-muted-foreground"
                >
                    {tu('fileHint')}
                </p>
                <Button type="submit" disabled={checkPending} className="w-fit">
                    {checkPending ? tu('checking') : tu('check')}
                </Button>
            </form>

            <div
                ref={resultRef}
                tabIndex={-1}
                className="flex flex-col gap-4 outline-none"
            >
                {save.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {tu(`saveErrors.${save.error}`)}
                    </p>
                )}
                {check.fileProblem && (
                    <p role="alert" className="text-sm text-destructive">
                        {tu(`fileProblems.${check.fileProblem}`, {
                            columns: (check.columns ?? []).join(', '),
                        })}
                    </p>
                )}
                {result && (
                    <div role="status" className="flex flex-col gap-1">
                        <p
                            className={
                                result.status === 'problems' ||
                                result.status === 'notFound'
                                    ? 'font-medium text-destructive'
                                    : 'font-medium'
                            }
                        >
                            {tu(`status.${result.status}`, {
                                file,
                                word: result.word,
                                slug: result.slug,
                                count:
                                    result.status === 'problems'
                                        ? result.problems.length
                                        : result.changes.length,
                            })}
                        </p>
                        {result.relatedIgnored && (
                            <p className="text-sm text-muted-foreground">
                                {tu('relatedIgnored')}
                            </p>
                        )}
                        {(check.ignoredColumns ?? []).length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {tu('ignored', {
                                    columns: check.ignoredColumns!.join(', '),
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {result?.status === 'notFound' && (
                <Button asChild variant="outline" className="w-fit">
                    <Link href="/admin/definitions/import">
                        {tu('goToImport')}
                    </Link>
                </Button>
            )}

            {result?.status === 'problems' && (
                <ul className="ml-5 list-disc text-sm">
                    {result.problems.map((problem) => (
                        <li key={problem.field + problem.key}>
                            <span className="font-medium">
                                {definitionFieldName(t, problem.field)}
                            </span>{' '}
                            <span className="font-mono text-xs">
                                ({columnOf(problem.field)})
                            </span>
                            {': '}
                            {t(`errors.${problem.key}`, {
                                max: limitFor(problem.field),
                            })}
                        </li>
                    ))}
                </ul>
            )}

            {result?.status === 'ready' && (
                <>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="lg" className="w-fit">
                                {tu('update', { word: result.word })}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={saveAction} className="contents">
                                <input
                                    type="hidden"
                                    name="locale"
                                    value={locale}
                                />
                                <input
                                    type="hidden"
                                    name="text"
                                    value={check.text ?? ''}
                                />
                                <input
                                    type="hidden"
                                    name="updatedAt"
                                    value={check.updatedAt ?? ''}
                                />
                                <DialogHeader>
                                    <DialogTitle>
                                        {tu('confirmTitle', {
                                            word: result.word,
                                        })}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {tu('confirmBody', {
                                            count: result.changes.length,
                                        })}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">
                                            {tu('notYet')}
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={savePending}
                                    >
                                        {savePending
                                            ? tu('updating')
                                            : tu('update', {
                                                  word: result.word,
                                              })}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <section
                        aria-labelledby="upload-changes"
                        className="flex flex-col gap-3"
                    >
                        <h2
                            id="upload-changes"
                            className="font-heading text-xl font-semibold"
                        >
                            {tu('changesTitle')}
                        </h2>
                        <ol className="flex flex-col gap-4">
                            {result.changes.map((change) => {
                                const lang = change.field.split('.')[0];
                                return (
                                    <li
                                        key={change.field}
                                        className="flex flex-col gap-2 rounded-lg border p-3"
                                    >
                                        <h3 className="font-medium">
                                            {definitionFieldName(
                                                t,
                                                change.field
                                            )}
                                        </h3>
                                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                            <div className="flex flex-col gap-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {tu('now')}
                                                </dt>
                                                <dd
                                                    lang={
                                                        change.before
                                                            ? lang
                                                            : undefined
                                                    }
                                                    className="break-words whitespace-pre-line text-muted-foreground"
                                                >
                                                    {change.before ||
                                                        tu('empty')}
                                                </dd>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {tu('new')}
                                                </dt>
                                                <dd
                                                    lang={
                                                        change.after
                                                            ? lang
                                                            : undefined
                                                    }
                                                    className="break-words whitespace-pre-line"
                                                >
                                                    {change.after ||
                                                        tu('empty')}
                                                </dd>
                                            </div>
                                        </dl>
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                </>
            )}
        </section>
    );
}
