import type { ReactNode } from 'react';

export interface CallToActionProps {
    title: string;
    description?: string;
    /** Usually a button or link. */
    action: ReactNode;
}

/** A full-width band asking the visitor to do one thing. */
export function CallToAction({
    title,
    description,
    action,
}: CallToActionProps) {
    return (
        <section className="border-t bg-muted/40">
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="font-heading text-2xl font-semibold tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
                {action}
            </div>
        </section>
    );
}
