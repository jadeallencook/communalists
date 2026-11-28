// The link a graphic's QR code opens. People type addresses the way they say
// them ("communalists.com/organization/sbma"), so a missing https:// is added.

/** A full http(s) link, or null if `input` isn't one. */
export function normalizeLink(input: string): string | null {
    const value = input.trim();
    if (!value || /\s/.test(value)) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value)
        ? value
        : `https://${value}`;
    try {
        const url = new URL(withScheme);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        if (!url.hostname.includes('.') && url.hostname !== 'localhost')
            return null;
        return url.href;
    } catch {
        return null;
    }
}

/** The link as printed under the QR code, for people who can't scan: no https:// or www. */
export function linkLabel(link: string): string {
    const url = new URL(link);
    const path = `${url.pathname}${url.search}`.replace(/\/$/, '');
    return `${url.host.replace(/^www\./, '')}${path}`;
}
