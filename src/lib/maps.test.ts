import { describe, expect, it } from 'vitest';

import { directionsUrl, MAP_PROVIDERS } from './maps';

const address = '749 Story Rd, San Jose, CA 95122';

describe('directionsUrl', () => {
    it('encodes the address for every provider', () => {
        for (const provider of MAP_PROVIDERS) {
            const url = directionsUrl(provider, address);
            expect(url).toContain('749%20Story%20Rd%2C%20San%20Jose');
            expect(url.startsWith('https://')).toBe(true);
        }
    });

    it('asks Apple and Google for directions, not just a pin', () => {
        expect(directionsUrl('apple', address)).toMatch(
            /^https:\/\/maps\.apple\.com\/\?daddr=/
        );
        expect(directionsUrl('google', address)).toContain(
            '/maps/dir/?api=1&destination='
        );
    });

    it('keeps characters like & and # inside the address', () => {
        expect(directionsUrl('google', 'A & B #2')).toContain(
            'A%20%26%20B%20%232'
        );
    });
});
