// From what people typed to the words on the graphic and its alt text.

import type { TextRole } from './layout';
import { linkLabel, normalizeLink } from './link';
import type { GraphicContent, TemplateKey } from './templates';
import { CJK } from './text';
import { formatWhen } from './when';

/** The graphic's own words, already in its language (from `Graphics.copy`). */
export interface GraphicWords {
    /** "Hosted by South Bay Mutual Aid" */
    hostedBy: (name: string) => string;
}

/** Every text on the graphic, in `locale`. Empty ones are left off it. */
export function graphicText(
    content: GraphicContent,
    locale: string,
    words: GraphicWords
): Record<TextRole, string> {
    const link = normalizeLink(content.link);
    const host = content.host.trim();
    return {
        tagline: content.tagline.trim(),
        title: content.title.trim(),
        when: formatWhen(
            content.date,
            content.startTime,
            content.endTime,
            locale
        ),
        place: content.place.trim(),
        details: content.details.trim(),
        host: host ? words.hostedBy(host) : '',
        link: link ? linkLabel(link) : '',
    };
}

const ENDS_SENTENCE = /[.!?。！？…]$/;

/** Ends `part` with a full stop if it doesn't end a sentence already (。 for Chinese). */
const sentence = (part: string) =>
    ENDS_SENTENCE.test(part) ? part : `${part}${CJK.test(part) ? '。' : '.'}`;

/**
 * Alt text to paste with the post: what kind of graphic it is, then every
 * word on it, in reading order. `intro` is like "Free store graphic" and
 * `qr` like "QR code to communalists.com/organization/sbma".
 */
export function altText(
    intro: string,
    text: Record<TextRole, string>,
    qr: string
): string {
    return [
        intro,
        text.tagline,
        text.title,
        text.when,
        text.place,
        text.details.replace(/\s*\n\s*/g, ' '),
        text.host,
        qr,
    ]
        .map((part) => part.trim())
        .filter(Boolean)
        .map(sentence)
        .join(' ');
}

/** A template's words in one language (messages → `Graphics.copy.templates`). */
export interface TemplateCopy {
    /** What it is, for the alt text: "free store". */
    name: string;
    title: string;
    tagline: string;
    details: string;
}

/** The words a graphic uses in one language (messages → `Graphics.copy`). */
export interface GraphicCopy {
    /** "Hosted by {name}" */
    hostedBy: string;
    /** "QR code to {link}" */
    qr: string;
    /** "{template} graphic" */
    alt: string;
    templates: Record<TemplateKey, TemplateCopy>;
}

/** Fills `{name}`-style placeholders (the copy only uses simple ones). */
export function interpolate(
    message: string,
    values: Record<string, string>
): string {
    return message.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? values[key] : match
    );
}
