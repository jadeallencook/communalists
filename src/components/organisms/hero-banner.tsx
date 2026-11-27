import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

export interface HeroBannerProps {
    image: StaticImageData;
    imageAlt: string;
    title: string;
    /** Text, or rich text (for example with marked words). */
    subtitle?: ReactNode;
    /** Usually a call-to-action button. */
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
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-28 sm:py-40">
                <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="max-w-xl text-lg text-pretty text-white/85 sm:text-xl">
                        {subtitle}
                    </p>
                )}
                {action}
            </div>
        </section>
    );
}
