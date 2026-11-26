// Directions to a public address in the map app people choose. Pure: no
// React or Next. Nothing is sent to a map service until someone opens a link.

export const MAP_PROVIDERS = ['apple', 'google', 'openstreetmap'] as const;
export type MapProvider = (typeof MAP_PROVIDERS)[number];

/** Display names; brand names aren't translated. */
export const MAP_PROVIDER_NAMES: Record<MapProvider, string> = {
    apple: 'Apple Maps',
    google: 'Google Maps',
    openstreetmap: 'OpenStreetMap',
};

/**
 * A link that opens directions to `address`. Apple's and Google's open their
 * app when it's installed, the website otherwise. OpenStreetMap has no
 * address-only directions link, so it searches for the address.
 */
export function directionsUrl(provider: MapProvider, address: string): string {
    const q = encodeURIComponent(address.trim());
    switch (provider) {
        case 'apple':
            return `https://maps.apple.com/?daddr=${q}`;
        case 'google':
            return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
        case 'openstreetmap':
            return `https://www.openstreetmap.org/search?query=${q}`;
    }
}
