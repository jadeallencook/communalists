'use client';

import Image from 'next/image';
import { useState } from 'react';

import { initials } from '@/lib/initials';
import { cn } from '@/lib/utils';

export interface AvatarProps {
    /** Whose picture: its initials show when there's no photo. */
    name: string;
    /** The photo's link, only when the viewer may see it (the server decides). */
    photo?: string;
    /** People are round; organization logos are rounded squares (logos often have text). */
    shape?: 'round' | 'square';
    /** Width and height in CSS pixels. */
    size: number;
    /** Initials colours: muted (lists) or primary (the header). */
    tone?: 'muted' | 'primary';
    className?: string;
}

/**
 * A person's photo or an organization's logo, or their initials. Always
 * decorative (hidden from screen readers): the name is written next to it,
 * so the picture adds nothing to read out. Falls back to initials if the
 * link stops working (the photo was changed or removed since the page was
 * made).
 */
export function Avatar({
    name,
    photo,
    shape = 'round',
    size,
    tone = 'muted',
    className,
}: AvatarProps) {
    const [failed, setFailed] = useState<string | null>(null);
    const showPhoto = photo && failed !== photo;
    return (
        <span
            aria-hidden
            style={{ width: size, height: size }}
            className={cn(
                'relative flex shrink-0 items-center justify-center overflow-hidden font-medium select-none',
                shape === 'round' ? 'rounded-full' : 'rounded-[22%]',
                tone === 'primary'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                size >= 64
                    ? 'text-xl font-semibold'
                    : size >= 40
                      ? 'text-sm'
                      : 'text-xs',
                className
            )}
        >
            {showPhoto ? (
                <Image
                    src={photo}
                    alt=""
                    width={size}
                    height={size}
                    // Already sized on upload (500 and 128 px squares).
                    unoptimized
                    className="size-full object-cover"
                    onError={() => setFailed(photo)}
                />
            ) : (
                initials(name)
            )}
        </span>
    );
}
