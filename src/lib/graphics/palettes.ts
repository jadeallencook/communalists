// Colour sets for graphics. People pick a set, never single colours, so every
// graphic stays readable: a test checks each set's contrast (WCAG AA).

export const PALETTE_KEYS = [
    'paper',
    'night',
    'garden',
    'sky',
    'rose',
    'sun',
    'mint',
    'clay',
    'grape',
    'ocean',
    'forest',
    'punk',
] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];

export interface Palette {
    background: string;
    /** Body text on the background. */
    text: string;
    /** Headlines, labels and bands. Large text only on the background. */
    accent: string;
    /** Text on an accent band. */
    onAccent: string;
}

export const PALETTES: Record<PaletteKey, Palette> = {
    paper: {
        background: '#F4EFE6',
        text: '#141414',
        accent: '#C4211A',
        onAccent: '#FFFFFF',
    },
    night: {
        background: '#141414',
        text: '#F4EFE6',
        accent: '#FFD23F',
        onAccent: '#141414',
    },
    garden: {
        background: '#1F4D2B',
        text: '#FFF8E7',
        accent: '#F2C14E',
        onAccent: '#1F4D2B',
    },
    sky: {
        background: '#E3EEFF',
        text: '#0B2545',
        accent: '#1D4ED8',
        onAccent: '#FFFFFF',
    },
    rose: {
        background: '#FFE4EA',
        text: '#3B0A1A',
        accent: '#A3123A',
        onAccent: '#FFFFFF',
    },
    sun: {
        background: '#FFC93C',
        text: '#1A1A1A',
        accent: '#7A1F00',
        onAccent: '#FFFFFF',
    },
    mint: {
        background: '#DFF5EA',
        text: '#0E3B2E',
        accent: '#0B6E4F',
        onAccent: '#FFFFFF',
    },
    clay: {
        background: '#F3E2D3',
        text: '#3A1F14',
        accent: '#9C3D1A',
        onAccent: '#FFFFFF',
    },
    grape: {
        background: '#2D1B4E',
        text: '#F7F0FF',
        accent: '#FFB347',
        onAccent: '#2D1B4E',
    },
    ocean: {
        background: '#0A2A43',
        text: '#EAF4FB',
        accent: '#5BC0EB',
        onAccent: '#0A2A43',
    },
    forest: {
        background: '#0F3D2E',
        text: '#F5F1E8',
        accent: '#B8E05C',
        onAccent: '#0F3D2E',
    },
    punk: {
        background: '#FF4FA3',
        text: '#111111',
        accent: '#111111',
        onAccent: '#FF4FA3',
    },
};

export const isPaletteKey = (value: string): value is PaletteKey =>
    (PALETTE_KEYS as readonly string[]).includes(value);

const channel = (hex: string, at: number) => {
    const c = parseInt(hex.slice(at, at + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance of a `#RRGGBB` colour (WCAG). */
export function luminance(hex: string): number {
    return (
        0.2126 * channel(hex, 1) +
        0.7152 * channel(hex, 3) +
        0.0722 * channel(hex, 5)
    );
}

/** WCAG contrast ratio between two `#RRGGBB` colours, 1 to 21. */
export function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}
