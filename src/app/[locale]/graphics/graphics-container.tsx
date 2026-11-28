'use client';

import { useLocale } from 'next-intl';
import { createContext, useContext, type ReactNode } from 'react';

import { graphicOrganizationAction } from '@/app/actions/graphics';
import {
    FillFromOrganization,
    GraphicEditor,
} from '@/components/organisms/graphic-editor';
import { GraphicPreview } from '@/components/organisms/graphic-preview';
import { GraphicsPage } from '@/components/pages/graphics-page';
import { useCopyLink } from '@/hooks/use-copy-link';
import { useGraphicEditor } from '@/hooks/use-graphic-editor';
import type { Locale } from '@/i18n/routing';
import type { GraphicCopy } from '@/lib/graphics';

// /graphics in the browser: the editor's state lives here, so nothing the
// person types is sent anywhere. The "Fill in from your organization" part
// needs the session, so the server streams it in (fillSlot) and it reaches
// the editor's fill function through context.

interface FillContext {
    fill?: (handle: string) => void;
    filling: boolean;
    error: boolean;
}

const GraphicFillContext = createContext<FillContext>({
    filling: false,
    error: false,
});

export function GraphicsContainer({
    copies,
    fillSlot,
}: {
    copies: Record<Locale, GraphicCopy>;
    fillSlot: ReactNode;
}) {
    const locale = useLocale() as Locale;
    const editor = useGraphicEditor({
        copies,
        locale,
        fillAction: graphicOrganizationAction,
    });
    const copyAlt = useCopyLink(editor.alt);
    return (
        <GraphicFillContext
            value={{
                fill: editor.fill,
                filling: editor.filling,
                error: editor.error === 'fill',
            }}
        >
            <GraphicsPage
                editor={
                    <GraphicEditor
                        {...editor}
                        error={editor.error}
                        fillSlot={fillSlot}
                    />
                }
                preview={
                    <GraphicPreview
                        canvasRef={editor.canvasRef}
                        aspect={editor.aspect}
                        ready={editor.ready}
                        overflow={editor.overflow}
                        alt={editor.alt}
                        save={editor.save}
                        share={editor.share}
                        notice={editor.notice}
                        error={editor.error}
                        copyStatus={copyAlt.status}
                        onCopyAlt={copyAlt.onCopy}
                    />
                }
            />
        </GraphicFillContext>
    );
}

/** The fill control, given the person's organizations (or a sign-in link) by the server. */
export function FillContainer({
    organizations,
    signInHref,
}: {
    organizations?: { handle: string; name: string }[];
    signInHref?: string;
}) {
    const { fill, filling, error } = useContext(GraphicFillContext);
    return (
        <FillFromOrganization
            organizations={organizations}
            fill={fill}
            filling={filling}
            signInHref={signInHref}
            error={error}
        />
    );
}
