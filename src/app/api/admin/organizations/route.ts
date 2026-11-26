import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { ADMIN_LOG_TAG } from '@/lib/organizations/claim-store';
import { exportOrganizations } from '@/lib/organizations/export-store';

// GET /api/admin/organizations → a CSV of every organization on Communalists,
// for super users only (features/18, decision #43). The find-organizations
// skill reads it to skip groups that are already here. Everyone else gets a
// plain 404, so the route doesn't reveal that it exists.
export async function GET() {
    const user = await getSessionUser();
    if (!user || !isPlatformAdmin(user.uid)) {
        return new NextResponse('Not found', { status: 404 });
    }
    let csv: string;
    try {
        ({ csv } = await exportOrganizations(user.uid));
    } catch (error) {
        console.error(
            '[export] organizations failed',
            (error as Error).message
        );
        return new NextResponse('Something went wrong', { status: 500 });
    }
    revalidateTag(ADMIN_LOG_TAG, 'max');
    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="communalists-organizations-${day}.csv"`,
            // Includes unlisted organizations: never cache it anywhere.
            'Cache-Control': 'private, no-store',
        },
    });
}
