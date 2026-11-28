'use client';

import { CheckIcon, CopyIcon, DownloadIcon, Share2Icon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useId, type Ref } from 'react';

import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import type { CopyLinkStatus } from '@/hooks/use-copy-link';
import type { GraphicError, GraphicNotice } from '@/hooks/use-graphic-editor';
import { track } from '@/lib/analytics';
import type { TextRole } from '@/lib/graphics';

export interface GraphicPreviewProps {
    /** The hook draws the preview into this canvas. */
    canvasRef: Ref<HTMLCanvasElement>;
    /** Width ÷ height of the chosen size, so space is kept before it draws. */
    aspect: number;
    /** The full-size file is made: Save and Share work. */
    ready: boolean;
    /** Text that was cut short. */
    overflow: TextRole[];
    alt: string;
    save: () => void;
    /** Only where the device can share files (most phones). */
    share?: () => void;
    notice?: GraphicNotice | null;
    error?: GraphicError | null;
    copyStatus: CopyLinkStatus;
    onCopyAlt: () => void;
}

/** The live preview, Save and Share, and the alt text to copy. No logic: it renders its props. */
export function GraphicPreview({
    canvasRef,
    aspect,
    ready,
    overflow,
    alt,
    save,
    share,
    notice,
    error,
    copyStatus,
    onCopyAlt,
}: GraphicPreviewProps) {
    const t = useTranslations('Graphics');
    const format = useFormatter();
    const id = useId();

    const noticeText = (() => {
        switch (notice?.kind) {
            case 'photo-added':
                return t('photo.added');
            case 'photo-removed':
                return t('photo.removed');
            case 'logo-added':
                return t('logo.added');
            case 'logo-removed':
                return t('logo.removed');
            case 'filled':
                return t('fill.done', { name: notice.name });
            case 'saved':
                return t('saved', { file: notice.file });
            case 'shared':
                return t('shared');
            default:
                return '';
        }
    })();

    return (
        <section
            id="graphic-preview"
            aria-labelledby={`${id}-heading`}
            className="flex scroll-mt-20 flex-col gap-4"
        >
            <h2
                id={`${id}-heading`}
                className="font-heading text-xl font-semibold tracking-tight"
            >
                {t('previewHeading')}
            </h2>
            <div className="flex justify-center rounded-lg bg-muted p-3">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={t('previewLabel')}
                    aria-describedby={`${id}-alt`}
                    style={{ aspectRatio: aspect }}
                    className="h-auto max-h-[40vh] w-auto max-w-full shadow-md lg:max-h-[65vh]"
                />
            </div>
            {overflow.length > 0 && (
                <p
                    role="status"
                    className="rounded-md border border-control p-3 text-sm"
                >
                    {t('overflow', {
                        fields: format.list(
                            overflow.map((role) => t(`overflowFields.${role}`)),
                            { type: 'conjunction' }
                        ),
                    })}
                </p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="lg"
                    aria-disabled={!ready || undefined}
                    onClick={() => ready && save()}
                >
                    <DownloadIcon aria-hidden />
                    {t('save')}
                </Button>
                {share && (
                    <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        aria-disabled={!ready || undefined}
                        onClick={() => ready && share()}
                    >
                        <Share2Icon aria-hidden />
                        {t('share')}
                    </Button>
                )}
            </div>
            <p role="status" className="text-sm empty:hidden">
                {ready ? noticeText : t('loading')}
            </p>
            {error === 'save' && (
                <p role="alert" className="text-sm text-destructive">
                    {t('saveError')}
                </p>
            )}
            <details className="rounded-lg border border-control">
                <summary className="flex min-h-11 cursor-pointer items-center px-4 py-2 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    {t('altSummary')}
                </summary>
                <div className="flex flex-col gap-2 px-4 pb-4">
                    <label
                        htmlFor={`${id}-alt`}
                        className="text-sm font-medium"
                    >
                        {t('altHeading')}
                    </label>
                    <p
                        id={`${id}-alt-hint`}
                        className="text-sm text-muted-foreground"
                    >
                        {t('altHint')}
                    </p>
                    <Textarea
                        id={`${id}-alt`}
                        value={alt}
                        readOnly
                        rows={4}
                        aria-describedby={`${id}-alt-hint`}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCopyAlt}
                            {...track('graphic-copy-alt')}
                        >
                            {copyStatus === 'copied' ? (
                                <CheckIcon aria-hidden />
                            ) : (
                                <CopyIcon aria-hidden />
                            )}
                            {t('copyAlt')}
                        </Button>
                        <p role="status" className="text-sm empty:hidden">
                            {copyStatus === 'copied'
                                ? t('copied')
                                : copyStatus === 'failed'
                                  ? t('copyFailed')
                                  : ''}
                        </p>
                    </div>
                </div>
            </details>
        </section>
    );
}
