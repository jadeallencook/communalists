import { useTranslations } from 'next-intl';

import type { ProfileView } from '@/lib/profiles';

import { ProfileCard } from './profile-card';

export type PreviewAudience = 'public' | 'comrade' | 'groupmate' | 'signedIn';
export const PREVIEW_AUDIENCES: PreviewAudience[] = [
    'public',
    'comrade',
    'groupmate',
    'signedIn',
];

export interface ProfilePreviewProps {
    /** The profile as each audience sees it (from the form's current values). */
    views: Record<PreviewAudience, ProfileView>;
    audience: PreviewAudience;
    onAudienceChange: (audience: PreviewAudience) => void;
}

/**
 * "Preview as…": the profile exactly as someone else sees it. Radio buttons
 * pick who; the card below follows the form as it's edited.
 */
export function ProfilePreview({
    views,
    audience,
    onAudienceChange,
}: ProfilePreviewProps) {
    const t = useTranslations('Profile');
    return (
        <section
            aria-labelledby="preview-title"
            className="flex flex-col gap-4 rounded-lg border p-5"
        >
            <h2
                id="preview-title"
                className="font-heading text-lg font-semibold"
            >
                {t('preview.title')}
            </h2>
            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm text-muted-foreground">
                    {t('preview.who')}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                    {PREVIEW_AUDIENCES.map((option) => (
                        <label
                            key={option}
                            className="cursor-pointer rounded-full border border-control px-2.5 py-1 text-sm select-none hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                        >
                            <input
                                type="radio"
                                name="previewAudience"
                                value={option}
                                checked={audience === option}
                                onChange={() => onAudienceChange(option)}
                                className="sr-only"
                            />
                            {t(`preview.audiences.${option}`)}
                        </label>
                    ))}
                </div>
            </fieldset>
            <p className="text-xs text-muted-foreground">
                {t(`preview.notes.${audience}`)}
            </p>
            <div className="rounded-lg border border-dashed p-4">
                <ProfileCard view={views[audience]} headingLevel={2} />
            </div>
        </section>
    );
}
