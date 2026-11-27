import type { ReactNode } from 'react';

import {
    FeatureCard,
    type FeatureCardProps,
} from '@/components/molecules/feature-card';

export interface FeatureGridProps {
    title: string;
    /** Text, or rich text (for example with marked words). */
    intro?: ReactNode;
    note?: string;
    features: (FeatureCardProps & { id: string })[];
    footnote?: string;
}

/** A section heading, intro paragraph and a responsive grid of feature cards. */
export function FeatureGrid({
    title,
    intro,
    note,
    features,
    footnote,
}: FeatureGridProps) {
    return (
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20">
            <div className="flex max-w-3xl flex-col gap-4">
                <h2 className="font-heading text-3xl font-semibold tracking-tight">
                    {title}
                </h2>
                {intro && (
                    <p className="text-lg text-pretty text-muted-foreground">
                        {intro}
                    </p>
                )}
                {note && (
                    <p className="text-sm text-muted-foreground">{note}</p>
                )}
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {features.map(({ id, ...feature }) => (
                    <li key={id}>
                        <FeatureCard {...feature} />
                    </li>
                ))}
            </ul>
            {footnote && (
                <p className="text-sm text-muted-foreground">{footnote}</p>
            )}
        </section>
    );
}
