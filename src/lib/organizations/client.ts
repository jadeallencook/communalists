import type { HandleProblem } from './handle';

// Client helpers for organizations. Plain fetch, no React or Next, so a
// future native app can reuse them (pass its API origin as baseUrl).

export type HandleCheck =
    { available: true } | { available: false; reason: HandleProblem | 'taken' };

export async function fetchHandleAvailability(
    handle: string,
    signal?: AbortSignal,
    baseUrl = ''
): Promise<HandleCheck> {
    const response = await fetch(
        `${baseUrl}/api/handles/${encodeURIComponent(handle)}`,
        { signal }
    );
    if (!response.ok)
        throw new Error(`Handle check failed: ${response.status}`);
    return (await response.json()) as HandleCheck;
}

// Browsers' built-in language names miss some codes (notably `ase`,
// American Sign Language), so those carry their own names.
const FALLBACK_NAMES: Record<string, Record<string, string>> = {
    ase: {
        en: 'American Sign Language',
        es: 'lengua de señas americana',
        vi: 'Ngôn ngữ ký hiệu Mỹ',
        zh: '美国手语',
    },
};

/** "Vietnamese" / "vietnamita" / "Tiếng Việt" / "越南语", from the browser or server's own data. */
export function languageName(code: string, locale: string): string {
    const fallback = FALLBACK_NAMES[code]?.[locale] ?? FALLBACK_NAMES[code]?.en;
    try {
        const name = new Intl.DisplayNames([locale], { type: 'language' }).of(
            code
        );
        return name && name !== code ? name : (fallback ?? code);
    } catch {
        return fallback ?? code;
    }
}
