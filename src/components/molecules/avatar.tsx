import { cn } from 'cn';

import { initials } from '@/lib/initials';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
    /** Whose photo: shown as initials when there's no photo. */
    name: string;
    /** From photoUrl() in src/lib/photos.ts; undefined shows initials. */
    photoUrl?: string;
    /** People are circles; organizations are rounded squares. */
    shape?: 'circle' | 'rounded';
    /** sm 28 px (header), md 44 px (cards), lg 64 px (profile pages). */
    size?: AvatarSize;
    className?: string;
}

const sizes: Record<AvatarSize, string> = {
    sm: 'size-7 text-xs',
    md: 'size-11 text-base',
    lg: 'size-16 text-xl',
};
const rounded: Record<AvatarSize, string> = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
};

/**
 * A photo, or initials when there isn't one. Decorative: it always sits next
 * to the name, so screen readers skip it.
 */
export function Avatar({
    name,
    photoUrl,
    shape = 'circle',
    size = 'md',
    className,
}: AvatarProps) {
    return (
        <span
            aria-hidden
            className={cn(
                'flex shrink-0 items-center justify-center overflow-hidden bg-muted font-medium select-none',
                sizes[size],
                shape === 'circle' ? 'rounded-full' : rounded[size],
                className
            )}
        >
            {photoUrl ? (
                // A plain <img>: photos are already small WebP files from
                // /api/photos, and the image optimizer would fetch them
                // without the viewer's session, so private ones would fail.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={photoUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                />
            ) : (
                initials(name)
            )}
        </span>
    );
}
