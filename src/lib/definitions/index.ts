// The dictionary: words explained once, in one place, so every page can point
// to them (`/dictionary/{slug}`). Pure: no React, Next or Firebase, so it's tested
// directly and a future mobile app can reuse it. The Firestore layer is
// ./store.ts. Design: documentation/features/19-dictionary.md.

import { z } from 'zod';

/** Every word is written in all four UI languages. Matches routing.locales (tested). */
export const DEFINITION_LOCALES = ['en', 'es', 'vi', 'zh'] as const;
export type DefinitionLocale = (typeof DEFINITION_LOCALES)[number];

export const SLUG_MIN = 2;
export const SLUG_MAX = 60;
export const WORD_MAX = 80;
/** The short definition: the page's lead, and (phase 2) the popover. */
export const DEFINITION_MAX = 300;
/** The optional longer explanation, shown only on the word's page. */
export const DETAILS_MAX = 5000;
export const RELATED_MAX = 10;

/** Lowercase words joined by single hyphens: `mutual-aid`. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Taken by routes beside `/admin/definitions/{slug}`. */
const RESERVED_SLUGS = new Set(['new', 'import', 'upload']);

export type SlugProblem = 'slugRequired' | 'slugFormat' | 'slugReserved';

/** Why a slug can't be used, or null. Slugs are permanent once published. */
export function slugProblem(slug: string): SlugProblem | null {
    if (!slug) return 'slugRequired';
    if (
        slug.length < SLUG_MIN ||
        slug.length > SLUG_MAX ||
        !SLUG_PATTERN.test(slug)
    )
        return 'slugFormat';
    if (RESERVED_SLUGS.has(slug)) return 'slugReserved';
    return null;
}

export type DefinitionErrorKey =
    | SlugProblem
    | 'wordRequired'
    | 'wordTooLong'
    | 'definitionRequired'
    | 'definitionTooLong'
    | 'detailsTooLong'
    | 'relatedTooMany';

const slugSchema = z
    .string({ error: 'slugRequired' })
    .trim()
    .superRefine((slug, ctx) => {
        const problem = slugProblem(slug);
        if (problem) ctx.addIssue({ code: 'custom', message: problem });
    });

/** One language's text. */
const entrySchema = z.object({
    word: z
        .string({ error: 'wordRequired' })
        .trim()
        .min(1, { error: 'wordRequired' })
        .max(WORD_MAX, { error: 'wordTooLong' }),
    definition: z
        .string({ error: 'definitionRequired' })
        .trim()
        .min(1, { error: 'definitionRequired' })
        .max(DEFINITION_MAX, { error: 'definitionTooLong' }),
    details: z
        .string()
        .trim()
        .max(DETAILS_MAX, { error: 'detailsTooLong' })
        .default(''),
});
export type DefinitionEntry = z.infer<typeof entrySchema>;

/**
 * The super user's form (and the starter glossary file). Errors are keys
 * under AdminDefinitions.errors in messages/*.json; each issue's path is
 * `['slug']`, `['related']` or `['text', locale, field]`.
 */
export const definitionInputSchema = z.object({
    slug: slugSchema,
    text: z.object({
        en: entrySchema,
        es: entrySchema,
        vi: entrySchema,
        zh: entrySchema,
    }),
    related: z
        .array(slugSchema)
        .max(RELATED_MAX, { error: 'relatedTooMany' })
        .default([]),
});
export type DefinitionInput = z.infer<typeof definitionInputSchema>;

/** A form field's name and id part: `slug`, `related`, or `en.word`. */
export type DefinitionField =
    'slug' | 'related' | `${DefinitionLocale}.${keyof DefinitionEntry}`;

/** The length limit an error message for this field mentions. */
export function limitFor(field: DefinitionField): number {
    if (field === 'slug') return SLUG_MAX;
    if (field === 'related') return RELATED_MAX;
    if (field.endsWith('.word')) return WORD_MAX;
    if (field.endsWith('.definition')) return DEFINITION_MAX;
    return DETAILS_MAX;
}

/** Maps a schema issue's path to the form field it belongs to. */
export function fieldForIssue(path: readonly PropertyKey[]): DefinitionField {
    if (path[0] === 'text' && path.length >= 3)
        return `${String(path[1])}.${String(path[2])}` as DefinitionField;
    return path[0] === 'related' ? 'related' : 'slug';
}

/**
 * Related words that can be linked: real, other than this one, without
 * repeats, in the order given.
 */
export function cleanRelated(
    slug: string,
    related: readonly string[],
    existing: ReadonlySet<string>
): string[] {
    return [...new Set(related)].filter(
        (other) => other !== slug && existing.has(other)
    );
}

// --- Resources: books, videos, articles and links (added later). Typed items,
// so a new type only adds its own fields; a page leaves out any type it
// doesn't know, so adding one never breaks older code.

export const RESOURCE_TYPES = ['book', 'video', 'article', 'link'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

const httpUrl = z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch {
            return false;
        }
    });

const resourceSchema = z.object({
    id: z.string().min(1).max(64),
    type: z.enum(RESOURCE_TYPES),
    title: z.string().trim().min(1).max(200),
    url: httpUrl,
    by: z.string().trim().max(200).optional(),
    language: z.string().trim().max(10).optional(),
});
export type DefinitionResource = z.infer<typeof resourceSchema>;

/** The resources a page can show: unknown types and broken items are left out. */
export function knownResources(value: unknown): DefinitionResource[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
        const parsed = resourceSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
    });
}

// --- Stored words.

/** A word as stored (`definitions/{slug}`), with defaults filled in. */
export interface Definition {
    slug: string;
    text: Record<DefinitionLocale, DefinitionEntry>;
    related: string[];
    resources: DefinitionResource[];
    createdAt?: number;
    updatedAt?: number;
}

const emptyEntry: DefinitionEntry = { word: '', definition: '', details: '' };
const str = (value: unknown) => (typeof value === 'string' ? value : '');

/**
 * Reads a stored document. Every field is optional here, so documents from
 * before a field existed still read; new sections are new optional fields,
 * never renames. Timestamps come in as millis.
 */
export function readDefinition(
    slug: string,
    data: Record<string, unknown>,
    times: { createdAt?: number; updatedAt?: number } = {}
): Definition {
    const stored = (data.text ?? {}) as Record<string, unknown>;
    const text = {} as Record<DefinitionLocale, DefinitionEntry>;
    for (const locale of DEFINITION_LOCALES) {
        const entry = (stored[locale] ?? {}) as Record<string, unknown>;
        text[locale] = {
            ...emptyEntry,
            word: str(entry.word),
            definition: str(entry.definition),
            details: str(entry.details),
        };
    }
    return {
        slug,
        text,
        related: Array.isArray(data.related)
            ? data.related.filter(
                  (s): s is string => typeof s === 'string' && !slugProblem(s)
              )
            : [],
        resources: knownResources(data.resources),
        ...times,
    };
}

/** One language's text, falling back to English for anything still blank. */
export interface LocalizedDefinition {
    slug: string;
    word: string;
    definition: string;
    /** The longer explanation, split into paragraphs. */
    details: string[];
    /** The language the text is actually in (for `lang`), when it fell back. */
    lang: DefinitionLocale;
}

export function localize(
    definition: Definition,
    locale: string
): LocalizedDefinition {
    const wanted = (DEFINITION_LOCALES as readonly string[]).includes(locale)
        ? (locale as DefinitionLocale)
        : 'en';
    const own = definition.text[wanted];
    // Word and definition fall back together, so they're in one language.
    const lang = own.word && own.definition ? wanted : 'en';
    const entry = definition.text[lang];
    return {
        slug: definition.slug,
        word: entry.word || definition.slug,
        definition: entry.definition,
        details: paragraphs(lang === wanted ? own.details : entry.details),
        lang,
    };
}

/** Blank lines separate paragraphs. */
export function paragraphs(text: string): string[] {
    return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
}

/** For the index: sorted by the word as it reads in the locale. */
export function sortByWord<T extends { word: string }>(
    items: readonly T[],
    locale: string
): T[] {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    return [...items].sort((a, b) => collator.compare(a.word, b.word));
}

/** Lowercase, without accents (Đ → d), for matching what someone types. */
const foldText = (text: string) =>
    text
        .replace(/[đĐ]/g, 'd')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

/**
 * Words matching what was typed, for the related-words search: by word or by
 * address, ignoring case and accents ("cafe" finds "Repair Café"). Words that
 * start with it come first, then words with a later word starting with it,
 * then any other match; each group keeps the order given. Empty text finds
 * nothing (the list is long).
 */
export function searchWords<T extends { slug: string; word: string }>(
    items: readonly T[],
    query: string,
    limit = 8
): T[] {
    const q = foldText(query);
    if (!q) return [];
    const qSlug = q.replace(/\s+/g, '-');
    const rank = (item: T) => {
        const word = foldText(item.word);
        if (word.startsWith(q) || item.slug.startsWith(qSlug)) return 0;
        if (word.split(/[\s\-–—/]+/).some((part) => part.startsWith(q)))
            return 1;
        if (word.includes(q) || item.slug.includes(qSlug)) return 2;
        return -1;
    };
    return items
        .map((item, index) => ({ item, index, rank: rank(item) }))
        .filter((r) => r.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .slice(0, limit)
        .map((r) => r.item);
}

/** The fields a save changes (`es.word`, `related`), for the admin log. */
export function changedFields(
    before: Definition,
    after: DefinitionInput
): string[] {
    const fields: string[] = [];
    for (const locale of DEFINITION_LOCALES)
        for (const key of ['word', 'definition', 'details'] as const)
            if (before.text[locale][key] !== after.text[locale][key])
                fields.push(`${locale}.${key}`);
    if (before.related.join() !== after.related.join()) fields.push('related');
    return fields;
}

/** Form data → the schema's input shape (field names as in DefinitionField). */
export function definitionFromForm(
    get: (name: string) => string,
    getAll: (name: string) => string[]
) {
    const text = {} as Record<DefinitionLocale, DefinitionEntry>;
    for (const locale of DEFINITION_LOCALES)
        text[locale] = {
            word: get(`${locale}.word`),
            definition: get(`${locale}.definition`),
            details: get(`${locale}.details`),
        };
    return {
        slug: get('slug').toLowerCase(),
        text,
        related: getAll('related'),
    };
}

/** What a marked word shows on hover: the short definition only. */
export interface DefinitionPreview {
    word: string;
    definition: string;
    /** The language the text is in (English when it isn't translated yet). */
    lang: DefinitionLocale;
}

/** Every word's preview in one language, keyed by slug (for /api/definitions). */
export function previewsFor(
    definitions: readonly Definition[],
    locale: string
): Record<string, DefinitionPreview> {
    const previews: Record<string, DefinitionPreview> = {};
    for (const definition of definitions) {
        const { word, definition: text, lang } = localize(definition, locale);
        if (text) previews[definition.slug] = { word, definition: text, lang };
    }
    return previews;
}

// --- Letters for /dictionary/{letter}.

/** The letter bar, A to Z. Letters in URLs are lowercase (`/dictionary/m`). */
export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
export type Letter = string;

/** True for a letter page's segment (one of a–z), as opposed to a word's slug. */
export const isLetter = (segment: string) =>
    segment.length === 1 && LETTERS.includes(segment);

// The first character of each pinyin initial, in pinyin order (no words start
// with i, u or v). With the pinyin collation, a character belongs to the last
// one it sorts at or after: 互 (hù) falls between 哈 (h) and 丌 (j), so h.
const PINYIN_STARTS: [Letter, string][] = [
    ['a', '阿'],
    ['b', '八'],
    ['c', '嚓'],
    ['d', '哒'],
    ['e', '妸'],
    ['f', '发'],
    ['g', '旮'],
    ['h', '哈'],
    ['j', '丌'],
    ['k', '咔'],
    ['l', '垃'],
    ['m', '妈'],
    ['n', '拏'],
    ['o', '噢'],
    ['p', '妑'],
    ['q', '七'],
    ['r', '呥'],
    ['s', '仨'],
    ['t', '他'],
    ['w', '屲'],
    ['x', '夕'],
    ['y', '丫'],
    ['z', '帀'],
];
let pinyin: Intl.Collator | undefined;

/**
 * The letter a word is listed under, as it reads in the locale: its first
 * letter without accents (Á → a, Đ → d), or for Chinese its pinyin initial
 * (互助 → h). Leading quotes and symbols are skipped. Falls back to the
 * slug's first letter.
 */
export function letterOf(word: string, locale: string, slug: string): Letter {
    const first = [...word].find((c) => /[\p{L}\p{N}]/u.test(c)) ?? '';
    if (/\p{Script=Han}/u.test(first)) {
        pinyin ??= new Intl.Collator('zh-u-co-pinyin');
        let found: Letter | null = null;
        for (const [letter, start] of PINYIN_STARTS)
            if (pinyin.compare(first, start) >= 0) found = letter;
        if (found) return found;
    }
    const base = first
        .replace(/[đĐ]/, 'd')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
    return isLetter(base) ? base : slug[0];
}
