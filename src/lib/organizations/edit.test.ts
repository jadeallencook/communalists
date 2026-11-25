import { describe, expect, it } from 'vitest';

import { changedFields } from './edit';
import { claimBlocks, handleHeldUntil, nextHandleChangeAt } from './handle';

const DAY = 86_400_000;
const now = Date.UTC(2026, 10, 23);

describe('changedFields', () => {
    it('lists only what differs, in form order', () => {
        expect(
            changedFields(
                {
                    name: 'A',
                    focusAreas: ['food'],
                    location: { placeId: '1' },
                    website: undefined,
                },
                {
                    name: 'A',
                    focusAreas: ['food', 'housing'],
                    location: { placeId: '2' },
                    website: undefined,
                }
            )
        ).toEqual(['focusAreas', 'location']);
    });

    it('notices a new street address', () => {
        expect(
            changedFields(
                { streetAddress: undefined },
                { streetAddress: '749 Story Rd' }
            )
        ).toEqual(['streetAddress']);
    });

    it('treats missing and undefined as the same', () => {
        expect(changedFields({ website: undefined }, {})).toEqual([]);
    });
});

describe('handle changes', () => {
    it('allows a change when never changed or after 30 days', () => {
        expect(nextHandleChangeAt(undefined, now)).toBeNull();
        expect(nextHandleChangeAt(now - 31 * DAY, now)).toBeNull();
        expect(nextHandleChangeAt(now - 10 * DAY, now)).toBe(now + 20 * DAY);
    });

    it("blocks another group's handle, but not an expired hold or one's own", () => {
        expect(claimBlocks(null, 'a', now)).toBe(false);
        expect(claimBlocks({ orgId: 'b' }, 'a', now)).toBe(true);
        expect(claimBlocks({ orgId: 'a' }, 'a', now)).toBe(false);
        expect(
            claimBlocks(
                { orgId: 'b', heldUntil: handleHeldUntil(now) },
                'a',
                now
            )
        ).toBe(true);
        expect(
            claimBlocks({ orgId: 'b', heldUntil: now - DAY }, 'a', now)
        ).toBe(false);
        // A new group (no id yet) is blocked by any live claim.
        expect(claimBlocks({ orgId: 'b' }, null, now)).toBe(true);
    });
});
