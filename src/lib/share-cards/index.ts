// Share cards: the generated link-preview images for profiles and
// organizations (decision #72). Pure; the drawing is in
// src/app/api/share-cards/.

/** The size every link-preview app expects. */
export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const;

export type ShareCardKind = 'person' | 'organization';

/**
 * A short version for a card's link, from everything the card shows. Apps
 * keep previews by link, so a changed name, photo or visibility gets a new
 * link and a fresh card. FNV-1a, in base 36: not a secret, just a key.
 */
export function shareCardVersion(
    ...parts: (string | number | undefined)[]
): string {
    let hash = 0x811c9dc5;
    for (const char of parts.map((p) => p ?? '').join('\u0000')) {
        hash ^= char.codePointAt(0)!;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(36);
}

/** Where a card is served. `id` is a username or an organization's handle. */
export function shareCardPath(
    kind: ShareCardKind,
    id: string,
    version: string
): string {
    return `/api/share-cards/${kind}/${encodeURIComponent(id)}?v=${version}`;
}
