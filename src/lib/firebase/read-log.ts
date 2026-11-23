import 'server-only';

// Development-only Firestore read counter, after the prototype's `log()` in
// DashboardContext (PR #60): see what each page costs while building it.
// Prints "[firestore read #12] users" for every document read that actually
// reaches Firestore (cache hits don't). Silent in production and tests.

let reads = 0;

export function logRead(collection: string, count = 1): void {
    if (
        process.env.NODE_ENV !== 'development' &&
        process.env.FIRESTORE_READ_LOG !== '1'
    )
        return;
    reads += count;
    console.log(
        `\x1b[35m[firestore read #${reads}]\x1b[0m ${collection}${count > 1 ? ` ×${count}` : ''}`
    );
}
