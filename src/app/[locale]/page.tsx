import { Suspense } from 'react';

import { HomePage } from '@/components/pages/home-page';
import { getSessionUser } from '@/lib/auth/session';

// The page shell is prerendered; only the session check streams in. Until it
// resolves, the fallback keeps the hero and join buttons hidden so a signed-in
// visitor never sees "Create account" flash before "Go to dashboard".
export default function Page() {
    return (
        <Suspense fallback={<HomePage />}>
            <HomeContainer />
        </Suspense>
    );
}

async function HomeContainer() {
    const user = await getSessionUser();
    return <HomePage signedIn={user !== null} />;
}
