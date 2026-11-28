import { Avatar } from '@/components/molecules/avatar';
import { Link } from '@/i18n/navigation';
import { profilePath } from '@/lib/paths';
import type { ComradeView } from '@/lib/profiles';

/** Comrades as a list of links to their profiles (on a profile and its comrades page). */
export function ComradeLinks({ comrades }: { comrades: ComradeView[] }) {
    return (
        <ul className="grid gap-2 sm:grid-cols-2">
            {comrades.map((c) => (
                <li key={c.uid}>
                    <Link
                        href={profilePath(c.username)}
                        className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                    >
                        <Avatar name={c.name} photo={c.photo} size={32} />
                        <span className="flex min-w-0 flex-col">
                            <span className="font-medium break-words">
                                {c.name}
                            </span>
                            <span className="break-words text-muted-foreground">
                                @{c.username}
                            </span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
