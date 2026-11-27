export interface WeeklyBarsProps {
    /** Unique on the page: names the chart and its table. */
    id: string;
    title: string;
    /** Oldest first, one per week. */
    weeks: { label: string; count: number }[];
    /** Already translated, e.g. "42 in the last 12 weeks, 5 in the latest week." */
    summary: string;
    showTable: string;
    weekColumn: string;
    countColumn: string;
}

/**
 * A small single-series bar chart, one bar per week. The bars are a picture
 * for sighted readers (hidden from screen readers); the summary and the table
 * carry the same numbers for everyone else. The latest week is darker.
 */
export function WeeklyBars({
    id,
    title,
    weeks,
    summary,
    showTable,
    weekColumn,
    countColumn,
}: WeeklyBarsProps) {
    const max = Math.max(1, ...weeks.map((w) => w.count));
    return (
        <figure
            aria-labelledby={`${id}-title`}
            className="flex flex-col gap-2 rounded-lg border p-4"
        >
            <figcaption className="flex flex-col gap-0.5">
                <span id={`${id}-title`} className="font-medium">
                    {title}
                </span>
                <span className="text-sm text-muted-foreground">{summary}</span>
            </figcaption>
            <div aria-hidden className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground tabular-nums">
                    {max}
                </span>
                <div className="flex h-24 items-end gap-0.5 border-b border-muted-foreground/60">
                    {weeks.map((week, i) => (
                        <div
                            key={week.label}
                            className="group relative flex h-full flex-1 items-end"
                        >
                            <div
                                className={
                                    i === weeks.length - 1
                                        ? 'w-full rounded-t-[4px] bg-foreground'
                                        : 'w-full rounded-t-[4px] bg-muted-foreground'
                                }
                                style={{
                                    height:
                                        week.count === 0
                                            ? 0
                                            : `max(2px, ${(week.count / max) * 100}%)`,
                                }}
                            />
                            {/* Hover: the week and its count. */}
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md ring-1 ring-border group-hover:block">
                                {week.label}: {week.count}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{weeks[0]?.label}</span>
                    <span>{weeks.at(-1)?.label}</span>
                </div>
            </div>
            <details className="text-sm">
                <summary className="w-fit cursor-pointer rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    {showTable}
                </summary>
                <table className="mt-2 w-full text-left">
                    <caption className="sr-only">{title}</caption>
                    <thead>
                        <tr className="border-b">
                            <th scope="col" className="py-1 font-medium">
                                {weekColumn}
                            </th>
                            <th
                                scope="col"
                                className="py-1 text-right font-medium"
                            >
                                {countColumn}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week) => (
                            <tr
                                key={week.label}
                                className="border-b last:border-0"
                            >
                                <td className="py-1">{week.label}</td>
                                <td className="py-1 text-right tabular-nums">
                                    {week.count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
}
