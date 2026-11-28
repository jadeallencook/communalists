#!/usr/bin/env node
// `pnpm dev`: everything needed for local development, in one command.
// `pnpm emulators` runs the same thing without Next (--emulators-only).
//
// 1. Creates .env.local from .env.example if it's missing (emulator settings).
// 2. Starts the Firebase emulators (Auth, Firestore and Storage; unless they're already
//    running) and waits until Auth answers. Data is kept in .emulator-data/.
//    Then adds the test accounts and organizations (scripts/seed.mjs) if any
//    are missing, so the dev toolbar's one-click sign-in always works.
// 3. Starts `next dev`. Extra arguments pass through: `pnpm dev --port 3001`.
// 4. On Ctrl-C, stops Next, then asks the Firebase CLI to save and exit.
//
// Saving needs care: Ctrl-C in a terminal signals the whole process group,
// which kills the emulators' Java processes before the CLI can export, leaving
// a half-written firebase-export-* folder and nothing saved. So the emulators
// run in their own process group, and only the CLI process gets SIGINT.
//
// Local dev never touches the real Firebase project. See
// documentation/getting-started.md and
// documentation/technical/accounts-and-sessions.md → "Local development".

import { spawn, spawnSync } from 'node:child_process';
import {
    copyFileSync,
    existsSync,
    readFileSync,
    readdirSync,
    rmSync,
} from 'node:fs';

const PROJECT = 'demo-communalists';
const DATA_DIR = '.emulator-data';
const AUTH_URL = 'http://127.0.0.1:9099/';
// Every port the emulators need (firebase.json + the CLI's reserved ones).
const EMULATOR_PORTS = [9099, 8080, 9199, 4000, 4400, 4500, 9150];
const READY_TIMEOUT_MS = 90_000;
const SAVE_TIMEOUT_MS = 60_000;

const emulatorsOnly = process.argv.includes('--emulators-only');
const nextArgs = process.argv.slice(2).filter((a) => a !== '--emulators-only');

const say = (message) => console.log(`\x1b[36m[dev]\x1b[0m ${message}`);
const fail = (message) => {
    console.error(`\x1b[31m[dev]\x1b[0m ${message}`);
    process.exit(1);
};

// --- 1. .env.local
if (!existsSync('.env.local')) {
    copyFileSync('.env.example', '.env.local');
    say('Created .env.local from .env.example (emulator settings).');
}

// --- Node version (a mismatch is allowed, but worth knowing).
const wanted = readFileSync('.nvmrc', 'utf8').trim().replace(/^v/, '');
const running = process.versions.node;
if (running !== wanted) {
    say(
        `Node ${running} is running; .nvmrc asks for ${wanted}. Run \`nvm use\` if anything misbehaves.`
    );
}

// --- 2. Emulators
const authUp = async () => {
    try {
        await fetch(AUTH_URL, { signal: AbortSignal.timeout(1000) });
        return true;
    } catch {
        return false;
    }
};

/** "8080 (java, pid 123)" for each emulator port something is listening on. */
function busyPorts() {
    return EMULATOR_PORTS.flatMap((port) => {
        const out = spawnSync(
            'lsof',
            ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fpc'],
            { encoding: 'utf8' }
        ).stdout;
        if (!out) return [];
        const pid = out.match(/^p(\d+)/m)?.[1];
        const command = out.match(/^c(.+)$/m)?.[1];
        return [{ port, pid, command }];
    });
}

let emulators = null;
if (await authUp()) {
    say('Firebase emulators already running; using them.');
} else {
    const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
    const javaVersion = Number(
        `${java.stderr ?? ''}${java.stdout ?? ''}`.match(/version "(\d+)/)?.[1]
    );
    if (java.error || !(javaVersion >= 21)) {
        fail(
            'The Firebase emulators need Java 21 or newer.\n' +
                '      macOS: brew install openjdk@21  (then follow its "sudo ln -sfn" note)\n' +
                '      Then run this again.'
        );
    }

    // Auth isn't answering, but something holds another emulator port: usually
    // an emulator left running after its CLI was killed.
    const busy = busyPorts();
    if (busy.length) {
        fail(
            'These emulator ports are in use, probably by leftover emulators:\n' +
                busy
                    .map(
                        ({ port, pid, command }) =>
                            `      ${port}: ${command ?? '?'} (pid ${pid ?? '?'})`
                    )
                    .join('\n') +
                `\n      Stop them (kill ${[...new Set(busy.map((b) => b.pid))].join(' ')}) and run this again.`
        );
    }

    // Half-written exports from emulators that were killed mid-save.
    for (const entry of readdirSync('.')) {
        if (entry.startsWith('firebase-export-')) {
            rmSync(entry, { recursive: true, force: true });
            say(`Removed ${entry} (an unfinished save from an earlier run).`);
        }
    }

    say(
        'Starting Firebase emulators (Auth, Firestore, Storage; UI at http://127.0.0.1:4000)…'
    );
    emulators = spawn(
        'firebase',
        [
            'emulators:start',
            '--project',
            PROJECT,
            '--only',
            'auth,firestore,storage',
            `--import=${DATA_DIR}`,
            '--export-on-exit',
        ],
        // Own process group: Ctrl-C in the terminal must not reach the
        // emulators' Java processes (see the comment at the top).
        { stdio: ['ignore', 'pipe', 'pipe'], detached: true }
    );
    const prefix = (stream, out) =>
        stream.on('data', (chunk) => {
            for (const line of chunk.toString().split('\n')) {
                if (line.trim())
                    out.write(`\x1b[33m[firebase]\x1b[0m ${line}\n`);
            }
        });
    prefix(emulators.stdout, process.stdout);
    prefix(emulators.stderr, process.stderr);
    emulators.on('error', (error) =>
        fail(
            `Couldn't start the Firebase CLI (${error.message}). Run \`pnpm install\`.`
        )
    );

    const started = Date.now();
    while (!(await authUp())) {
        if (emulators.exitCode !== null) {
            // Usually another emulator run grabbed the ports first.
            const taken = busyPorts();
            fail(
                taken.length
                    ? 'The emulators could not start: their ports were taken by another run:\n' +
                          taken
                              .map(
                                  ({ port, pid, command }) =>
                                      `      ${port}: ${command ?? '?'} (pid ${pid ?? '?'})`
                              )
                              .join('\n') +
                          '\n      If another `pnpm dev` or `pnpm emulators` is running, use that one or stop it first.'
                    : 'The Firebase emulators exited during startup (see the [firebase] lines above).'
            );
        }
        if (Date.now() - started > READY_TIMEOUT_MS) {
            await stopEmulators();
            fail('The Firebase emulators took too long to start.');
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    say(
        emulatorsOnly
            ? 'Emulators ready. Ctrl-C to save and stop.'
            : 'Emulators ready.'
    );
}

// Test accounts and organizations, only if any are missing (fast otherwise).
const seed = spawnSync(
    'node',
    [
        '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
        'scripts/seed.mjs',
        '--if-missing',
    ],
    {
        stdio: 'inherit',
    }
);
if (seed.status !== 0) {
    say('Adding test data failed (see above). Try `pnpm seed` once it is up.');
}

// --- 3. Next
const next = emulatorsOnly
    ? null
    : spawn('next', ['dev', ...nextArgs], {
          stdio: 'inherit',
          // No Google metadata server off the cloud: without this, Firestore
          // looks for one, waits seconds, and Next shows a MetadataLookupWarning.
          env: { ...process.env, METADATA_SERVER_DETECTION: 'none' },
      });

// --- 4. Shutdown
function stopEmulators() {
    if (!emulators || emulators.exitCode !== null) return Promise.resolve();
    say('Saving emulator data and stopping the emulators…');
    return new Promise((resolve) => {
        const force = setTimeout(() => {
            say('Saving took too long; stopping the emulators without it.');
            try {
                process.kill(-emulators.pid, 'SIGKILL');
            } catch {
                // already gone
            }
            resolve();
        }, SAVE_TIMEOUT_MS);
        emulators.once('exit', () => {
            clearTimeout(force);
            resolve();
        });
        // Only the CLI: it exports, then shuts its emulators down itself.
        try {
            emulators.kill('SIGINT');
        } catch {
            clearTimeout(force);
            resolve();
        }
    });
}

let stopping = false;
async function shutdown(code = 0) {
    if (stopping) return;
    stopping = true;
    if (next && next.exitCode === null) next.kill('SIGINT');
    await stopEmulators();
    process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
next?.on('exit', (code) => shutdown(code ?? 0));
if (emulators) {
    emulators.on('exit', (code) => {
        if (!stopping) {
            console.error('[dev] The Firebase emulators stopped unexpectedly.');
            shutdown(code ?? 1);
        }
    });
}
