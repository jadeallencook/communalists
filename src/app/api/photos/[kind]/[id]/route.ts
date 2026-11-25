import { getSessionUser } from '@/lib/auth/session';
import {
    readOrganizationPhoto,
    readUserPhoto,
    shareActiveGroup,
} from '@/lib/photo-store';
import { isPhotoKind } from '@/lib/photos';
import {
    profileViewer,
    seesDetails,
    type ProfileVisibility,
} from '@/lib/profiles';

// GET /api/photos/{org|user}/{id}?v={version} → the stored WebP photo
// (decision #42). Organization photos are public while the organization is
// active. A person's photo follows their profile visibility, checked here on
// every request against fresh data, so a link to it never shows it to
// someone who couldn't see it on the profile. `v` changes with every new
// photo, so browsers may keep each response for a while.
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/photos/[kind]/[id]'>
) {
    const { kind, id } = await params;
    if (!isPhotoKind(kind) || !id || id.length > 128) return notFound();

    if (kind === 'org') {
        const stored = await readOrganizationPhoto(id);
        return stored
            ? photo(stored.data, 'public, max-age=86400')
            : notFound();
    }

    const stored = await readUserPhoto(id);
    if (!stored || !(await maySee(id, stored.visibility))) return notFound();
    // Private: it depends on who's asking, so shared caches must not keep it.
    return photo(stored.photo.data, 'private, max-age=3600');
}

async function maySee(
    uid: string,
    visibility: ProfileVisibility
): Promise<boolean> {
    if (visibility === 'public') return true;
    const viewer = await getSessionUser();
    if (!viewer) return false;
    if (viewer.uid === uid) return true;
    if (visibility !== 'groups') return false;
    return seesDetails(
        visibility,
        profileViewer({
            isSelf: false,
            signedIn: true,
            sharesGroup: await shareActiveGroup(uid, viewer.uid),
        })
    );
}

function photo(data: Buffer, cacheControl: string) {
    return new Response(new Uint8Array(data), {
        headers: {
            'content-type': 'image/webp',
            'cache-control': cacheControl,
            'x-content-type-options': 'nosniff',
        },
    });
}

// The same answer for "no such photo" and "not yours to see", so the
// response never reveals that a hidden photo exists.
const notFound = () =>
    new Response(null, {
        status: 404,
        headers: { 'cache-control': 'private, no-store' },
    });
