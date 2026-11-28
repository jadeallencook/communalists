'use server';

import { updateTag } from 'next/cache';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import {
    DIRECTORY_TAG,
    getMembershipFresh,
    getOrganizationById,
    handleTag,
    membershipsTag,
    orgMembersTag,
    orgTag,
    setOrganizationPhoto,
    type SetOrganizationPhotoResult,
} from '@/lib/organizations';
import { effectiveRole } from '@/lib/platform-admin';
import { uploadProblem, type Photo, type PhotoKind } from '@/lib/photos';
import {
    deletePhotoFiles,
    processPhoto,
    savePhotoFiles,
} from '@/lib/photos/store';
import {
    getUserProfileFresh,
    removeUserPhotoAsModerator,
    setUserPhoto,
    userTag,
} from '@/lib/users';
import {
    organizationPhotoSchema,
    photoModerationSchema,
    type PhotoActionState,
} from '@/lib/validation/photo';

import { syncMemberCopies } from './sync-member-copies';

// Profile photos and organization logos (decision #71). The browser sends
// a cropped square as `photo`; everything is checked again here. Storage
// rules deny clients, so these actions are the only way in.

type State = PhotoActionState;

/** Reads, checks and processes the uploaded file. */
async function processedUpload(formData: FormData) {
    const file = formData.get('photo');
    const problem = uploadProblem(file instanceof File ? file : null);
    if (problem) return { ok: false, error: problem } as const;
    const bytes = Buffer.from(await (file as File).arrayBuffer());
    return processPhoto(bytes);
}

/** Deletes replaced files; a failure leaves an orphan file, so it's only logged. */
async function deleteQuietly(
    kind: PhotoKind,
    ownerId: string,
    photo: Photo | undefined
) {
    if (!photo) return;
    await deletePhotoFiles(kind, ownerId, photo.id).catch((error: Error) =>
        console.error('[photos] delete failed', error.message)
    );
}

// --- Your own profile photo.

/** Saves the signed-in person's profile photo, replacing any earlier one. */
export async function uploadProfilePhotoAction(
    _previous: State,
    formData: FormData
): Promise<State> {
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return { error: 'notAllowed', at };
    try {
        const processed = await processedUpload(formData);
        if (!processed.ok) return { error: processed.error, at };
        const photo = await savePhotoFiles('users', user.uid, processed.files);
        const previous = await setUserPhoto(user.uid, photo).catch(
            async (error: Error) => {
                // Not saved: don't leave the new files behind.
                await deleteQuietly('users', user.uid, photo);
                throw error;
            }
        );
        await deleteQuietly('users', user.uid, previous);
    } catch (error) {
        console.error(
            '[photos] profile upload failed',
            (error as Error).message
        );
        return { error: 'generic', at };
    }
    updateTag(userTag(user.uid));
    await syncMemberCopies(user.uid);
    return { done: 'uploaded', at };
}

/** Removes the signed-in person's profile photo. */
export async function removeProfilePhotoAction(): Promise<State> {
    const at = Date.now();
    const user = await getSessionUser();
    if (!user) return { error: 'notAllowed', at };
    try {
        const previous = await setUserPhoto(user.uid, null);
        await deleteQuietly('users', user.uid, previous);
    } catch (error) {
        console.error(
            '[photos] profile remove failed',
            (error as Error).message
        );
        return { error: 'generic', at };
    }
    updateTag(userTag(user.uid));
    await syncMemberCopies(user.uid);
    return { done: 'removed', at };
}

// --- Organization logos (owners and moderators).

/** Clears everything that shows an organization's logo. */
function clearOrganization(
    orgId: string,
    result: Extract<SetOrganizationPhotoResult, { ok: true }>
) {
    updateTag(orgTag(orgId));
    updateTag(handleTag(result.handle));
    updateTag(orgMembersTag(orgId)); // its moderation log
    updateTag(DIRECTORY_TAG);
    updateTag(ADMIN_LOG_TAG); // super users acting for the team
    for (const uid of result.copyHolders) updateTag(membershipsTag(uid));
}

/** Who is acting on an organization, as setOrganizationPhoto checks them. */
async function editorFor(orgId: string) {
    const user = await getSessionUser();
    if (!user) return null;
    const profile = await getUserProfileFresh(user.uid);
    return {
        uid: user.uid,
        displayName: profile?.displayName ?? '',
        platformAdmin: isPlatformAdmin(user.uid),
        orgId,
    };
}

/**
 * Quick check before writing any file, so people who can't edit never put
 * files in Storage. setOrganizationPhoto checks again on fresh data.
 */
async function mayEdit(
    editor: NonNullable<Awaited<ReturnType<typeof editorFor>>>
) {
    const [org, membership] = await Promise.all([
        getOrganizationById(editor.orgId),
        getMembershipFresh(editor.orgId, editor.uid),
    ]);
    if (!org) return false;
    const role = effectiveRole(
        membership?.status === 'active' ? membership.role : null,
        org,
        editor.platformAdmin
    );
    return role === 'owner' || role === 'moderator';
}

/** Saves an organization's logo, replacing any earlier one. */
export async function uploadOrganizationPhotoAction(
    _previous: State,
    formData: FormData
): Promise<State> {
    const at = Date.now();
    const parsed = organizationPhotoSchema.safeParse({
        orgId: formData.get('orgId'),
    });
    if (!parsed.success) return { error: 'generic', at };
    const { orgId } = parsed.data;
    const editor = await editorFor(orgId);
    if (!editor) return { error: 'notAllowed', at };
    let result: SetOrganizationPhotoResult;
    try {
        if (!(await mayEdit(editor))) return { error: 'notAllowed', at };
        const processed = await processedUpload(formData);
        if (!processed.ok) return { error: processed.error, at };
        const photo = await savePhotoFiles(
            'organizations',
            orgId,
            processed.files
        );
        result = await setOrganizationPhoto(orgId, editor, photo).catch(
            async (error: Error) => {
                await deleteQuietly('organizations', orgId, photo);
                throw error;
            }
        );
        if (!result.ok) {
            await deleteQuietly('organizations', orgId, photo);
            return { error: 'notAllowed', at };
        }
        await deleteQuietly('organizations', orgId, result.previous);
    } catch (error) {
        console.error('[photos] logo upload failed', (error as Error).message);
        return { error: 'generic', at };
    }
    clearOrganization(orgId, result);
    return { done: 'uploaded', at };
}

/** Removes an organization's logo (owners and moderators). */
export async function removeOrganizationPhotoAction(
    _previous: State,
    formData: FormData
): Promise<State> {
    const at = Date.now();
    const parsed = organizationPhotoSchema.safeParse({
        orgId: formData.get('orgId'),
    });
    if (!parsed.success) return { error: 'generic', at };
    const { orgId } = parsed.data;
    const editor = await editorFor(orgId);
    if (!editor) return { error: 'notAllowed', at };
    let result: SetOrganizationPhotoResult;
    try {
        result = await setOrganizationPhoto(orgId, editor, null);
        if (!result.ok) return { error: 'notAllowed', at };
        await deleteQuietly('organizations', orgId, result.previous);
    } catch (error) {
        console.error('[photos] logo remove failed', (error as Error).message);
        return { error: 'generic', at };
    }
    clearOrganization(orgId, result);
    return { done: 'removed', at };
}

// --- Moderation: super users remove a photo or logo, with a reason.

/** A super user removes someone's photo or an organization's logo (logged in adminLog). */
export async function removePhotoAsModeratorAction(
    _previous: State,
    formData: FormData
): Promise<State> {
    const at = Date.now();
    const user = await getSessionUser();
    if (!user || !isPlatformAdmin(user.uid)) return { error: 'notAllowed', at };
    const parsed = photoModerationSchema.safeParse({
        kind: formData.get('kind'),
        id: formData.get('id'),
        reason: formData.get('reason'),
    });
    if (!parsed.success)
        return {
            error: parsed.error.issues.some((i) => i.path[0] === 'reason')
                ? 'reasonRequired'
                : 'generic',
            at,
        };
    const { kind, id, reason } = parsed.data;
    try {
        if (kind === 'users') {
            const previous = await removeUserPhotoAsModerator(
                id,
                user.uid,
                reason
            );
            await deleteQuietly('users', id, previous);
            updateTag(userTag(id));
            updateTag(ADMIN_LOG_TAG);
            await syncMemberCopies(id);
        } else {
            const editor = await editorFor(id);
            const result = await setOrganizationPhoto(id, editor!, null, {
                reason,
            });
            if (!result.ok) return { error: 'notAllowed', at };
            await deleteQuietly('organizations', id, result.previous);
            clearOrganization(id, result);
        }
    } catch (error) {
        console.error(
            '[photos] moderation remove failed',
            (error as Error).message
        );
        return { error: 'generic', at };
    }
    return { done: 'removed', at };
}
