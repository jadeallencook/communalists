// "When" on a graphic: the date and times people typed, written out in the
// graphic's language. The date input gives `YYYY-MM-DD` and the time inputs
// `HH:MM`, with no time zone: they mean the wall-clock time where the event
// is, so they're formatted as UTC and never shifted.

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2})$/;

function parseDate(value: string): Date | null {
    const match = DATE.exec(value);
    if (!match) return null;
    const [, y, m, d] = match.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCMonth() === m - 1 ? date : null;
}

function parseTime(value: string): Date | null {
    const match = TIME.exec(value);
    if (!match) return null;
    const [, h, m] = match.map(Number);
    return h < 24 && m < 60 ? new Date(Date.UTC(1970, 0, 1, h, m)) : null;
}

/** "Saturday, December 6", in `locale`. Empty if the date isn't valid. */
export function formatDate(value: string, locale: string): string {
    const date = parseDate(value);
    if (!date) return '';
    return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

/** "10 AM – 2 PM", "6:30 – 8 PM" or "10 AM", in `locale`. Minutes only when needed. */
export function formatTimes(start: string, end: string, locale: string) {
    const from = parseTime(start);
    const to = parseTime(end);
    if (!from) return '';
    const minutes = [from, to].some((t) => t && t.getUTCMinutes() !== 0);
    const format = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        ...(minutes ? { minute: '2-digit' } : {}),
        timeZone: 'UTC',
    });
    if (!to || to.getTime() === from.getTime()) return format.format(from);
    return format.formatRange(from, to);
}

/** The date and times on one line: "Saturday, December 6 · 10 AM – 2 PM". */
export function formatWhen(
    date: string,
    start: string,
    end: string,
    locale: string
): string {
    return [formatDate(date, locale), formatTimes(start, end, locale)]
        .filter(Boolean)
        .join(' · ');
}
