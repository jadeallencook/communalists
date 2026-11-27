import { defineConfig } from 'vitest/config';

// Security rules tests (`pnpm test:rules`): they need the Firestore emulator,
// so they're kept out of `pnpm test`. See documentation/technical/tooling-and-ci.md.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['rules/**/*.test.ts'],
        // The emulator answers slower than a unit test.
        testTimeout: 15_000,
    },
});
