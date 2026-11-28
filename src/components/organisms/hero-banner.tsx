import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface HeroBannerProps {
    image: StaticImageData;
    imageAlt: string;
    title: string;
    /** Text, or rich text (for example with marked words). */
    subtitle?: ReactNode;
    /**
     * Shown in a translucent band along the bottom of the banner, full width
     * and at least 1/6 of the screen tall, in the dark theme so it reads on
     * the photo. Usually the search or a call-to-action button.
     */
    action?: ReactNode;
}

/** Full-width photo with a dark overlay so white text stays readable in both themes. */
export function HeroBanner({
    image,
    imageAlt,
    title,
    subtitle,
    action,
}: HeroBannerProps) {
    return (
        <section className="relative isolate overflow-hidden">
            <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                placeholder="blur"
                sizes="100vw"
                className="-z-10 object-cover"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/55 to-black/35"
            />
            <div
                className={cn(
                    'mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 pt-28 sm:pt-40',
                    action ? 'pb-16 sm:pb-24' : 'pb-28 sm:pb-40'
                )}
            >
                <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="max-w-xl text-lg text-pretty text-white/85 sm:text-xl">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="dark border-t border-white/15 bg-black/40 text-foreground backdrop-blur-sm">
                    <div className="mx-auto flex min-h-[16.67vh] max-w-6xl items-center px-4 py-5">
                        {action}
                    </div>
                </div>
            )}
        </section>
    );
}
