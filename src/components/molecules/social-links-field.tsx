import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useId } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    FieldDescription,
    FieldError,
    FieldLegend,
    FieldSet,
} from '@/components/atoms/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/components/atoms/input-group';
import {
    SOCIAL_PLATFORM_KEYS,
    SOCIAL_PLATFORMS,
    type SocialLink,
    type SocialPlatform,
} from '@/lib/socials';

export type { SocialLink };

export interface SocialLinksFieldProps {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
    /** Already-translated error from the last submit. */
    error?: string;
}

const selectClass =
    'h-8 shrink-0 rounded-lg border border-control bg-transparent px-2.5 text-sm dark:bg-input/30';

/**
 * Rows of platform + username, with add and remove. People type only the
 * username; the platform's address is shown in front of it. Submits
 * socialPlatform[] / socialHandle[].
 */
export function SocialLinksField({
    links,
    onChange,
    error,
}: SocialLinksFieldProps) {
    const t = useTranslations('Organizations');
    const hintId = useId();
    const used = new Set(links.map((l) => l.platform));
    const nextPlatform = SOCIAL_PLATFORM_KEYS.find((p) => !used.has(p));
    const update = (index: number, patch: Partial<SocialLink>) =>
        onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));

    return (
        <FieldSet data-invalid={!!error}>
            <FieldLegend variant="label">{t('form.socials')}</FieldLegend>
            {links.map((link, index) => {
                const platform = SOCIAL_PLATFORMS[link.platform];
                return (
                    <div key={index} className="flex flex-wrap gap-2">
                        <select
                            name="socialPlatform"
                            value={link.platform}
                            onChange={(event) =>
                                update(index, {
                                    platform: event.target
                                        .value as SocialPlatform,
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
                        <InputGroup className="w-auto min-w-48 flex-1">
                            <InputGroupAddon aria-hidden>
                                <InputGroupText>
                                    {platform.prefix}
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                name="socialHandle"
                                value={link.handle}
                                onChange={(event) =>
                                    update(index, {
                                        handle: event.target.value,
                                    })
                                }
                                autoCapitalize="none"
                                autoCorrect="off"
                                autoComplete="off"
                                spellCheck={false}
                                maxLength={300}
                                aria-label={t('form.socialHandle', {
                                    platform: platform.name,
                                })}
                                aria-describedby={hintId}
                                aria-invalid={error ? true : undefined}
                            />
                        </InputGroup>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                onChange(links.filter((_, i) => i !== index))
                            }
                            aria-label={t('form.socialRemove', {
                                platform: platform.name,
                            })}
                        >
                            <Trash2Icon aria-hidden />
                        </Button>
                    </div>
                );
            })}
            {nextPlatform && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                        onChange([
                            ...links,
                            { platform: nextPlatform, handle: '' },
                        ])
                    }
                >
                    <PlusIcon aria-hidden />
                    {t('form.socialAdd')}
                </Button>
            )}
            <div id={hintId}>
                {error ? (
                    <FieldError>{error}</FieldError>
                ) : (
                    <FieldDescription>{t('form.socialsHint')}</FieldDescription>
                )}
            </div>
        </FieldSet>
    );
}
