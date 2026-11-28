import { z } from 'zod';

import { REASON_MAX_LENGTH } from '@/lib/organizations/membership';
import { PHOTO_KINDS } from '@/lib/photos';

// Photo uploads and removals (src/app/actions/photos.ts). The file itself is
// checked with uploadProblem (src/lib/photos) and again by sharp. Errors are
// keys under Photo.errors.

export type PhotoErrorKey =
    | 'missing'
    | 'tooLarge'
    | 'wrongType'
    | 'unreadable'
    | 'notSquare'
    | 'notAllowed'
    | 'reasonRequired'
    | 'generic';

/** What a photo action reports back. `at` makes each result a new value. */
export interface PhotoActionState {
    error?: PhotoErrorKey;
    done?: 'uploaded' | 'removed';
    at?: number;
}

/** Which organization's logo (the photo itself is a separate field). */
export const organizationPhotoSchema = z.object({
    orgId: z.string().min(1).max(128),
});

/** A super user removing a photo or logo: whose, and why (required, like other moderation). */
export const photoModerationSchema = z.object({
    kind: z.enum(PHOTO_KINDS),
    id: z.string().min(1).max(128),
    reason: z.string().trim().min(1).max(REASON_MAX_LENGTH),
});
