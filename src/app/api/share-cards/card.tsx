import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ImageResponse } from 'next/og';
import sharp from 'sharp';

import shareImage from '@/assets/share-image.jpg';
import { getAdminBucket } from '@/lib/firebase/admin';
import { initials } from '@/lib/initials';
import { photoPath, type Photo, type PhotoKind } from '@/lib/photos';
import {
    fontFilesFor,
    parseFontsourceCss,
    type FontFile,
} from '@/lib/share-cards/fonts';
import { SHARE_CARD_SIZE } from '@/lib/share-cards';
import { getSiteUrl } from '@/lib/site';

// Draws a share card (decision #72): the photo or initials, a name and one
// line under it, and "Communalists". Fonts come from the bundled @fontsource
// packages, never a font service, so a name's characters stay on our server
// (next.config.ts traces the files into the function).

const FONT_ROOT = path.join(process.cwd(), 'node_modules', '@fontsource');
/** Latin, Vietnamese and others first, then Simplified Chinese. */
const FONT_PACKAGES = ['noto-sans', 'noto-sans-sc'];

let fontIndex: Promise<{ pkg: string; font: FontFile }[]> | null = null;
const fontData = new Map<string, Promise<Buffer>>();

/** Every font file with its ranges, read once per server instance. */
function loadFontIndex() {
    fontIndex ??= Promise.all(
        FONT_PACKAGES.map(async (pkg) => {
            const css = await readFile(
                path.join(FONT_ROOT, pkg, '600.css'),
                'utf8'
            );
            return parseFontsourceCss(css).map((font) => ({ pkg, font }));
        })
    ).then((lists) => lists.flat());
    return fontIndex;
}

/** The fonts needed to draw `text`, each a separate family, in fallback order. */
async function fontsFor(text: string) {
    const index = await loadFontIndex();
    const files = fontFilesFor(
        text,
        index.map(({ font }) => font)
    );
    return Promise.all(
        files.map(async (file) => {
            const { pkg } = index.find(({ font }) => font.file === file)!;
            if (!fontData.has(file))
                fontData.set(
                    file,
                    readFile(path.join(FONT_ROOT, pkg, 'files', file))
                );
            return {
                name: file,
                data: await fontData.get(file)!,
                weight: 600 as const,
                style: 'normal' as const,
            };
        })
    );
}

/**
 * The photo as a PNG data URL, read from Storage directly (not through its
 * link). The drawing library can't read WebP.
 */
export async function photoForCard(
    kind: PhotoKind,
    ownerId: string,
    photo: Photo
): Promise<string> {
    const [webp] = await getAdminBucket()
        .file(photoPath(kind, ownerId, photo.id, 'large'))
        .download();
    const png = await sharp(webp).resize(320, 320).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
}

/** Cached by apps and the CDN for an hour; a changed card gets a new link. */
const HEADERS = { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' };

export async function shareCard({
    name,
    detail,
    photo,
    shape,
}: {
    name: string;
    /** The line under the name: @username, or a city. */
    detail: string;
    /** A PNG data URL, or none for initials. */
    photo?: string;
    shape: 'round' | 'square';
}) {
    const cleanName = name.normalize('NFC');
    const cleanDetail = detail.normalize('NFC');
    const letters = initials(cleanName);
    const fonts = await fontsFor(
        `${cleanName}${cleanDetail}${letters}Communalists`
    );
    const radius = shape === 'round' ? 160 : 70;
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 80,
                // The site's dark theme (globals.css .dark): background,
                // foreground, muted and muted-foreground.
                background: '#0a0a0a',
                color: '#fafafa',
                fontFamily: fonts.map((f) => f.name).join(', '),
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: 56,
                }}
            >
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- drawn into a PNG, not a page
                    <img
                        src={photo}
                        width={320}
                        height={320}
                        alt=""
                        style={{ borderRadius: radius, flexShrink: 0 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 320,
                            height: 320,
                            borderRadius: radius,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#262626',
                            fontSize: 120,
                        }}
                    >
                        {letters}
                    </div>
                )}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        maxWidth: 664,
                    }}
                >
                    <div
                        style={{
                            fontSize: cleanName.length > 28 ? 56 : 72,
                            lineHeight: 1.1,
                        }}
                    >
                        {cleanName}
                    </div>
                    <div style={{ fontSize: 40, color: '#a1a1a1' }}>
                        {cleanDetail}
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: 36,
                }}
            >
                Communalists
            </div>
        </div>,
        { ...SHARE_CARD_SIZE, fonts, headers: HEADERS }
    );
}

/**
 * When a card can't be drawn (Firebase or the fonts failed), the site's
 * share image instead, so a preview still shows something. Not cached.
 */
export function fallbackCard(error: unknown) {
    console.error('[share-cards] card failed', (error as Error).message);
    return Response.redirect(`${getSiteUrl()}${shareImage.src}`, 302);
}
