'use client';

import {
    CheckIcon,
    ChevronRightIcon,
    DatabaseIcon,
    LogInIcon,
    RotateCcwIcon,
    WrenchIcon,
} from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/atoms/popover';
import {
    DEV_TOOLBAR_CORNERS,
    type DevToolbarCorner,
} from '@/hooks/use-dev-toolbar-corner';
import { cn } from '@/lib/utils';

// Developer-only (never rendered for real visitors), so its text is English
// and not in messages/*.json. See tooling-and-ci.md → "Dev toolbar".

export interface DevToolbarProps {
    /** Seeded test accounts, with a line about each. Featured ones come first; the rest sit under a collapsed "More accounts". */
    accounts: { email: string; summary: string; featured: boolean }[];
    /** Sent with sign-in so the dashboard opens in this language. */
    locale: string;
    /** In the app, the devSignIn server action. */
    signInAction: (formData: FormData) => void | Promise<void>;
    /** In the app, resetTestData via useActionState. */
    resetAction: (formData: FormData) => void;
    resetPending?: boolean;
    resetStatus?: 'done' | 'failed';
    corner: DevToolbarCorner;
    onCornerChange: (corner: DevToolbarCorner) => void;
    /** Storybook: start open. */
    defaultOpen?: boolean;
}

const cornerClass: Record<DevToolbarCorner, string> = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-16 right-4',
    'top-left': 'top-16 left-4',
};

const cornerLabel: Record<DevToolbarCorner, string> = {
    'bottom-right': 'Bottom right',
    'bottom-left': 'Bottom left',
    'top-right': 'Top right',
    'top-left': 'Top left',
};

const row =
    'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-60';

/** Local development tools in a floating corner menu: one-click test sign-in, reset test data, position. */
export function DevToolbar({
    accounts,
    locale,
    signInAction,
    resetAction,
    resetPending = false,
    resetStatus,
    corner,
    onCornerChange,
    defaultOpen,
}: DevToolbarProps) {
    const top = corner.startsWith('top');
    const featured = accounts.filter((account) => account.featured);
    const more = accounts.filter((account) => !account.featured);
    const accountRow = ({
        email,
        summary,
    }: {
        email: string;
        summary: string;
    }) => (
        <form key={email} action={signInAction}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={row}>
                <LogInIcon
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex min-w-0 flex-col">
                    <span className="truncate">{email}</span>
                    <span className="truncate text-xs text-muted-foreground">
                        {summary}
                    </span>
                </span>
            </button>
        </form>
    );
    const right = corner.endsWith('right');

    return (
        <div className={cn('fixed z-50', cornerClass[corner])}>
            <Popover defaultOpen={defaultOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 font-mono text-xs shadow-md hover:bg-muted"
                    >
                        <WrenchIcon aria-hidden className="size-3.5" />
                        Dev
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    side={top ? 'bottom' : 'top'}
                    align={right ? 'end' : 'start'}
                    sideOffset={8}
                    className="w-80 gap-0 p-1.5"
                >
                    <p className="px-2.5 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
                        Sign in as
                    </p>
                    {featured.map(accountRow)}
                    {more.length > 0 && (
                        <details className="group">
                            <summary
                                className={cn(
                                    row,
                                    'cursor-pointer list-none text-xs text-muted-foreground [&::-webkit-details-marker]:hidden'
                                )}
                            >
                                <ChevronRightIcon
                                    aria-hidden
                                    className="size-4 shrink-0 transition-transform group-open:rotate-90"
                                />
                                More accounts ({more.length})
                            </summary>
                            <div className="max-h-72 overflow-y-auto">
                                {more.map(accountRow)}
                            </div>
                        </details>
                    )}

                    <div className="my-1.5 border-t" />

                    <form action={resetAction}>
                        <button
                            type="submit"
                            className={row}
                            disabled={resetPending}
                        >
                            <RotateCcwIcon
                                aria-hidden
                                className={cn(
                                    'size-4 shrink-0 text-muted-foreground',
                                    resetPending && 'animate-spin'
                                )}
                            />
                            <span className="flex-1">Reset test data</span>
                            <span
                                role="status"
                                className={cn(
                                    'flex items-center gap-1 text-xs',
                                    resetStatus === 'failed'
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {resetPending ? (
                                    'Resetting…'
                                ) : resetStatus === 'done' ? (
                                    <>
                                        <CheckIcon
                                            aria-hidden
                                            className="size-3.5"
                                        />
                                        Done
                                    </>
                                ) : resetStatus === 'failed' ? (
                                    'Failed: see terminal'
                                ) : (
                                    'pnpm seed'
                                )}
                            </span>
                        </button>
                    </form>
                    <a
                        href="http://127.0.0.1:4000"
                        target="_blank"
                        rel="noreferrer"
                        className={row}
                    >
                        <DatabaseIcon
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground"
                        />
                        <span className="flex-1">Emulator UI</span>
                        <span className="text-xs text-muted-foreground">
                            :4000
                        </span>
                    </a>

                    <div className="my-1.5 border-t" />

                    <label className="flex items-center gap-3 px-2.5 py-2">
                        <span className="flex-1">Position</span>
                        <select
                            value={corner}
                            onChange={(event) =>
                                onCornerChange(
                                    event.target.value as DevToolbarCorner
                                )
                            }
                            className="h-7 rounded-md border bg-transparent px-1.5 text-xs dark:bg-input/30"
                        >
                            {DEV_TOOLBAR_CORNERS.map((option) => (
                                <option key={option} value={option}>
                                    {cornerLabel[option]}
                                </option>
                            ))}
                        </select>
                    </label>
                </PopoverContent>
            </Popover>
        </div>
    );
}
