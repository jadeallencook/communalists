import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    FieldDescription,
    FieldError,
    FieldLegend,
    FieldSet,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import {
    SOCIAL_PLATFORM_KEYS,
    SOCIAL_PLATFORMS,
    type SocialPlatform,
} from '@/lib/organizations/options';

export interface SocialLink {
    platform: SocialPlatform;
    url: string;
}

export interface SocialLinksFieldProps {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
    /** Already-translated error from the last submit. */
    error?: string;
}

const selectClass =
    'h-8 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30';

/** Rows of platform + link, with add and remove. Submits socialPlatform[] / socialUrl[]. */
export function SocialLinksField({
    links,
    onChange,
    error,
}: SocialLinksFieldProps) {
    const t = useTranslations('Organizations');
    const used = new Set(links.map((l) => l.platform));
    const nextPlatform = SOCIAL_PLATFORM_KEYS.find((p) => !used.has(p));
    const update = (index: number, patch: Partial<SocialLink>) =>
        onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));

    return (
        <FieldSet data-invalid={!!error}>
            <FieldLegend variant="label">{t('form.socials')}</FieldLegend>
            {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                    <select
                        name="socialPlatform"
                        value={link.platform}
                        onChange={(event) =>
                            update(index, {
                                platform: event.target.value as SocialPlatform,
                            })
                        }
                        aria-label={t('form.socialPlatform')}
                        className={selectClass}
                    >
                        {SOCIAL_PLATFORM_KEYS.map((key) => (
                            <option key={key} value={key}>
                                {SOCIAL_PLATFORMS[key].name}
                            </option>
                        ))}
                    </select>
                    <Input
                        name="socialUrl"
                        type="url"
                        inputMode="url"
                        value={link.url}
                        onChange={(event) =>
                            update(index, { url: event.target.value })
                        }
                        placeholder={`${SOCIAL_PLATFORMS[link.platform].domains[0]}/…`}
                        aria-label={t('form.socialUrl', {
                            platform: SOCIAL_PLATFORMS[link.platform].name,
                        })}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            onChange(links.filter((_, i) => i !== index))
                        }
                        aria-label={t('form.socialRemove', {
                            platform: SOCIAL_PLATFORMS[link.platform].name,
                        })}
                    >
                        <Trash2Icon aria-hidden />
                    </Button>
                </div>
            ))}
            {nextPlatform && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                        onChange([
                            ...links,
                            { platform: nextPlatform, url: '' },
                        ])
                    }
                >
                    <PlusIcon aria-hidden />
                    {t('form.socialAdd')}
                </Button>
            )}
            {error ? (
                <FieldError>{error}</FieldError>
            ) : (
                <FieldDescription>{t('form.socialsHint')}</FieldDescription>
            )}
        </FieldSet>
    );
}
