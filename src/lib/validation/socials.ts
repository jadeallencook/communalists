import { z } from 'zod';

import {
    parseSocialHandle,
    SOCIAL_PLATFORM_KEYS,
    type SocialLink,
    type SocialPlatform,
} from '@/lib/socials';

// Social links, shared by the organization and profile forms. Errors are
// keys: socialInvalid, socialMismatch, socialDuplicate.

/** Rows typed into the form; empty rows are dropped before this runs. */
export const socialLinksSchema = z
    .array(
        z.object({
            platform: z.enum(SOCIAL_PLATFORM_KEYS as [SocialPlatform]),
            handle: z.string().max(300),
        })
    )
    .max(SOCIAL_PLATFORM_KEYS.length)
    .transform((rows, ctx): SocialLink[] => {
        const links: SocialLink[] = [];
        for (const { platform, handle } of rows) {
            if (links.some((l) => l.platform === platform)) {
                ctx.addIssue({ code: 'custom', message: 'socialDuplicate' });
                return z.NEVER;
            }
            const parsed = parseSocialHandle(platform, handle);
            if ('problem' in parsed) {
                ctx.addIssue({ code: 'custom', message: parsed.problem });
                return z.NEVER;
            }
            links.push({ platform, handle: parsed.handle });
        }
        return links;
    });

/** Reads the socialPlatform[] / socialHandle[] form fields, dropping empty rows. */
export function socialFormValues(formData: FormData) {
    const platforms = formData.getAll('socialPlatform').map(String);
    const handles = formData.getAll('socialHandle').map(String);
    return platforms
        .map((platform, i) => ({ platform, handle: handles[i] ?? '' }))
        .filter((s) => s.handle.trim());
}
