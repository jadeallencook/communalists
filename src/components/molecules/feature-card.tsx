import type { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

/** An icon, a title and a sentence: one item in a feature list. */
export function FeatureCard({
    icon: Icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="flex h-full flex-col gap-3 rounded-xl border bg-card p-6">
            <Icon aria-hidden className="size-6" />
            <h3 className="font-heading text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
