import { getSessionUser } from '@/lib/auth/session';
import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';
import { isHandleTaken } from '@/lib/organizations';

// GET /api/handles/{handle} → { available, reason? } for the create form's
// live check. Signed-in only, so it can't be used to rack up anonymous reads.
// The create action checks again inside its transaction; this is a hint.
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/handles/[handle]'>
) {
    if (!(await getSessionUser())) {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
    const handle = normalizeHandle((await params).handle);
    const problem = handleProblem(handle);
    const body = problem
        ? { available: false, reason: problem }
        : (await isHandleTaken(handle))
          ? { available: false, reason: 'taken' }
          : { available: true };
    return Response.json(body, {
        headers: { 'cache-control': 'private, no-store' },
    });
}
