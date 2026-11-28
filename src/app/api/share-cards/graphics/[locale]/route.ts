import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { PALETTES, type PaletteKey, type TemplateKey } from '@/lib/graphics';

import { fallbackCard, graphicsCard } from '../../card';

// GET /api/share-cards/graphics/{locale} → the link-preview image for
// /graphics: "Make some propaganda" and three sample flyers, in the page's
// language. Nothing personal: the words are the templates' own.

const SAMPLES: {
    template: TemplateKey;
    palette: PaletteKey;
    style: 'band' | 'bold' | 'block';
}[] = [
    { template: 'free-store', palette: 'rose', style: 'band' },
    { template: 'protest', palette: 'paper', style: 'bold' },
    { template: 'ice-watch', palette: 'night', style: 'block' },
];

export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/share-cards/graphics/[locale]'>
) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale))
        return new Response(null, { status: 404 });
    try {
        const t = await getTranslations({ locale, namespace: 'Graphics' });
        return await graphicsCard({
            headline: t('title'),
            subtitle: t('shareSubtitle'),
            flyers: SAMPLES.map(({ template, palette, style }) => ({
                title: t(`copy.templates.${template}.title`),
                tagline: t(`copy.templates.${template}.tagline`),
                style,
                ...PALETTES[palette],
            })),
        });
    } catch (error) {
        return fallbackCard(error);
    }
}
