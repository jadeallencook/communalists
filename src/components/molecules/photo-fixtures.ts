// Sample photos for stories: small SVGs as data URLs, so stories need no
// network or emulator. Real photos come from /api/photos (src/lib/photos.ts).

const svg = (body: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">${body}</svg>`
    )}`;

/** A person: a simple face on a warm background. */
export const samplePersonPhoto = svg(
    '<rect width="256" height="256" fill="#f4a261"/><circle cx="128" cy="104" r="52" fill="#6d4c41"/><ellipse cx="128" cy="236" rx="92" ry="70" fill="#2a9d8f"/>'
);

/** An organization: a logo-like mark. */
export const sampleOrgPhoto = svg(
    '<rect width="256" height="256" fill="#264653"/><path d="M128 52 L196 188 H60 Z" fill="#e9c46a"/><circle cx="128" cy="150" r="22" fill="#264653"/>'
);
