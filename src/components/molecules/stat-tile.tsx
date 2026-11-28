import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

export interface StatTileProps {
    label: string;
    /** Already formatted, e.g. "512" or "38%". */
    value: string;
    /** A line under the value, e.g. "120 unclaimed · 4 deleted". */
    detail?: string;
    /** How it compares with the period before. The text carries the meaning; the arrow only repeats it. */
    comparison?: { text: string; trend: 'up' | 'down' | 'same' };
}

const TREND_ICON = { up: ArrowUpIcon, down: ArrowDownIcon, same: MinusIcon };

/**
 * One number with its label. Read as a term and its value (`<dt>`/`<dd>`),
 * so it must sit inside a `<dl>`.
 */
export function StatTile({ label, value, detail, comparison }: StatTileProps) {
    const Icon = comparison ? TREND_ICON[comparison.trend] : null;
    return (
        <div className="flex flex-col gap-1 rounded-lg border p-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-heading text-3xl font-semibold tabular-nums">
                {value}
            </dd>
            {comparison && Icon && (
                <dd className="flex items-start gap-1 text-sm">
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <span>{comparison.text}</span>
                </dd>
            )}
            {detail && (
                <dd className="text-sm text-pretty text-muted-foreground">
                    {detail}
                </dd>
            )}
        </div>
    );
}
