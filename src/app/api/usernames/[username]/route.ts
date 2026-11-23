import { getSessionUser } from '@/lib/auth/session';
import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';
import { isUsernameTaken } from '@/lib/users';

// GET /api/usernames/{username} → { available, reason? } for the live check in
// account setup and settings. Signed-in only, like /api/handles. The save
// checks again inside its transaction; this is a hint. Your own username
// counts as available.
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/usernames/[username]'>
) {
    const user = await getSessionUser();
    if (!user) {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
    const username = normalizeHandle((await params).username);
    const problem = handleProblem(username);
    const body = problem
        ? { available: false, reason: problem }
        : (await isUsernameTaken(username, user.uid))
          ? { available: false, reason: 'taken' }
          : { available: true };
    return Response.json(body, {
        headers: { 'cache-control': 'private, no-store' },
    });
}
