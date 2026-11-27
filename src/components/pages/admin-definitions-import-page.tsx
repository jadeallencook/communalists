'use client';

import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
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
import {
    columnOf,
    DEFINITIONS_IMPORT_MAX_ROWS,
    type CheckedDefinitionRow,
    type DefinitionsFileProblem,
} from '@/lib/definitions/import';

export interface CheckDefinitionsState {
    fileName?: string;
    /** The file as read, sent back so "Add" can send it again. */
    text?: string;
    rows?: Omit<CheckedDefinitionRow, 'input'>[];
    ignoredColumns?: string[];
    fileProblem?: DefinitionsFileProblem | 'noFile' | 'notAllowed' | 'generic';
    /** Missing columns, for `missingColumns`. */
    columns?: string[];
    /** Changes on every result, so focus moves to it each time. */
    at?: number;
}

export interface AddDefinitionsState {
    error?: 'nothingReady' | 'changed' | 'notAllowed' | 'generic';
    at?: number;
}

export interface AdminDefinitionsImportPageProps {
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** A `data:` link to the header-only template. */
    templateHref: string;
    /** In the app, checkDefinitionsAction via useActionState. */
    checkAction: (formData: FormData) => void;
    checkPending?: boolean;
    check: CheckDefinitionsState;
    /** In the app, addDefinitionsAction via useActionState. */
    addAction: (formData: FormData) => void;
    addPending?: boolean;
    add: AddDefinitionsState;
}

/**
 * /admin/definitions/import, for super users: upload a CSV, see every row
 * checked (ready, already in the dictionary, or what to fix), then add the
 * ready ones. Nothing is added until "Add". No logic: it renders the states.
 */
export function AdminDefinitionsImportPage({
    locale,
    templateHref,
    checkAction,
    checkPending = false,
    check,
    addAction,
    addPending = false,
    add,
}: AdminDefinitionsImportPageProps) {
    const t = useTranslations('AdminDefinitions');
    const ti = useTranslations('AdminDefinitions.import');
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (check.at || add.at) resultRef.current?.focus();
    }, [check.at, add.at]);

    const rows = check.rows ?? [];
    const count = (status: CheckedDefinitionRow['status']) =>
        rows.filter((row) => row.status === status).length;
    const ready = count('ready');

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
                    {ti('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {ti('intro')}
                </p>
            </header>

            <section
                aria-labelledby="import-format"
                className="flex flex-col gap-2"
            >
                <h2
                    id="import-format"
                    className="font-heading text-xl font-semibold"
                >
                    {ti('formatTitle')}
                </h2>
                <ul className="ml-5 list-disc text-sm text-pretty">
                    <li>{ti('formatSlug')}</li>
                    <li>{ti('formatLanguages')}</li>
                    <li>{ti('formatRelated')}</li>
                    <li>
                        {ti('formatLimit', {
                            max: DEFINITIONS_IMPORT_MAX_ROWS,
                        })}
                    </li>
                </ul>
                <Button asChild variant="outline" className="w-fit">
                    <a href={templateHref} download="definitions-template.csv">
                        <DownloadIcon aria-hidden />
                        {ti('template')}
                    </a>
                </Button>
            </section>

            <form
                action={checkAction}
                className="flex flex-col gap-3 rounded-lg border p-4"
            >
                <input type="hidden" name="locale" value={locale} />
                <Label htmlFor="definitions-file">{ti('file')}</Label>
                <Input
                    id="definitions-file"
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    required
                />
                <p className="text-sm text-muted-foreground">
                    {ti('fileHint')}
                </p>
                <Button type="submit" disabled={checkPending} className="w-fit">
                    {checkPending ? ti('checking') : ti('check')}
                </Button>
            </form>

            <div
                ref={resultRef}
                tabIndex={-1}
                className="flex flex-col gap-4 outline-none"
            >
                {add.error && (
                    <p role="alert" className="text-sm text-destructive">
                        {ti(`addErrors.${add.error}`)}
                    </p>
                )}
                {check.fileProblem && (
                    <p role="alert" className="text-sm text-destructive">
                        {ti(`fileProblems.${check.fileProblem}`, {
                            columns: (check.columns ?? []).join(', '),
                            max: DEFINITIONS_IMPORT_MAX_ROWS,
                        })}
                    </p>
                )}
                {rows.length > 0 && (
                    <div role="status" className="flex flex-col gap-1">
                        <p className="font-medium">
                            {ti('summary', {
                                file: check.fileName ?? '',
                                total: rows.length,
                                ready,
                                exists: count('exists'),
                                problems: count('problems'),
                            })}
                        </p>
                        {(check.ignoredColumns ?? []).length > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {ti('ignored', {
                                    columns: check.ignoredColumns!.join(', '),
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {rows.length > 0 && (
                <>
                    {ready > 0 ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-fit">
                                    {ti('add', { count: ready })}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form action={addAction} className="contents">
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
                                    <DialogHeader>
                                        <DialogTitle>
                                            {ti('confirmTitle', {
                                                count: ready,
                                            })}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {ti('confirmBody')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                {ti('notYet')}
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={addPending}
                                        >
                                            {addPending
                                                ? ti('adding')
                                                : ti('confirm', {
                                                      count: ready,
                                                  })}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            {ti('noneReady')}
                        </p>
                    )}

                    <ol className="flex flex-col divide-y rounded-lg border">
                        {rows.map((row) => (
                            <li
                                key={row.line}
                                className="flex flex-col gap-2 p-3"
                            >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <span className="flex min-w-0 flex-col">
                                        <span className="font-medium break-words">
                                            {row.word || ti('noWord')}
                                        </span>
                                        <span className="font-mono text-xs break-all text-muted-foreground">
                                            {ti('line', { line: row.line })}
                                            {row.slug &&
                                                ` · /dictionary/${row.slug}`}
                                        </span>
                                    </span>
                                    <span
                                        className={
                                            row.status === 'problems'
                                                ? 'text-sm font-medium text-destructive'
                                                : 'text-sm font-medium'
                                        }
                                    >
                                        {ti(`status.${row.status}`, {
                                            count: row.problems.length,
                                        })}
                                    </span>
                                </div>
                                {row.status === 'exists' && (
                                    <Link
                                        href={`/admin/definitions/${row.slug}`}
                                        className="w-fit text-sm underline underline-offset-4"
                                    >
                                        {t('editWord', { word: row.word })}
                                    </Link>
                                )}
                                {row.problems.length > 0 && (
                                    <ul className="ml-5 list-disc text-sm">
                                        {row.problems.map((problem) => (
                                            <li
                                                key={
                                                    problem.field + problem.key
                                                }
                                            >
                                                <span className="font-medium">
                                                    {definitionFieldName(
                                                        t,
                                                        problem.field
                                                    )}
                                                </span>{' '}
                                                <span className="font-mono text-xs">
                                                    ({columnOf(problem.field)})
                                                </span>
                                                {': '}
                                                {problem.key ===
                                                    'slugRepeated' ||
                                                problem.key === 'relatedUnknown'
                                                    ? ti(
                                                          `problems.${problem.key}`,
                                                          {
                                                              value:
                                                                  problem.value ??
                                                                  '',
                                                          }
                                                      )
                                                    : t(
                                                          `errors.${problem.key}`,
                                                          {
                                                              max: limitFor(
                                                                  problem.field
                                                              ),
                                                          }
                                                      )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </section>
    );
}
