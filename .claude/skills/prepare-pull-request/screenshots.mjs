#!/usr/bin/env node
// Adds screenshots to a pull request's description.
//
//   pnpm pr:screenshots --pr 153 new.png="Desktop: header"
//   pnpm pr:screenshots --pr 153 --before old.png new.png="Phone: header"
//   pnpm pr:screenshots --pr 153 --dry-run …     (prints the Markdown, pushes nothing)
//
// Each `path=Caption` is one screenshot of the change. `--before <path>` just
// in front of it pairs it with the same view on main, shown side by side.
// Captions starting with "Phone" are shown narrower.
//
// The images are committed to the `pr-screenshots` branch, which is never
// merged, under `pr-<number>/`. The commit is built with git plumbing and a
// temporary index, so the current branch, index and working tree are never
// touched. The branch carries its own vercel.json that turns deployments off.
// The description gets a "Screenshots" section between marker comments,
// replaced on re-runs. Links are pinned to the commit, so they keep working.
// The repo is public: only screenshots of the local app with seeded test
// data. See SKILL.md → Screenshots and decision #62.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';

const BRANCH = 'pr-screenshots';
const START = '<!-- screenshots -->';
const END = '<!-- /screenshots -->';
const IMAGE = /^\.(png|jpe?g|gif|webp)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

const BRANCH_FILES = {
    'README.md':
        '# PR screenshots\n\nImages linked from pull request descriptions, one folder per PR. This branch is never merged. It is written by `.claude/skills/prepare-pull-request/screenshots.mjs` on `main`. Only screenshots of the local app with seeded test data belong here: the repo is public.\n',
    // Vercel reads this from the pushed commit: no deployments for this branch.
    'vercel.json': '{ "git": { "deploymentEnabled": false } }\n',
};

function fail(message) {
    console.error(`pr:screenshots: ${message}`);
    process.exit(1);
}

function run(cmd, args, options = {}) {
    return execFileSync(cmd, args, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
    }).trim();
}

// ---- Arguments --------------------------------------------------------------

const args = process.argv.slice(2);
let pr = null;
let dryRun = false;
const shots = [];
let before = null;
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--pr') pr = args[++i];
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--before') before = args[++i];
    else if (arg === '--') continue;
    else {
        const at = arg.indexOf('=');
        const path = at === -1 ? arg : arg.slice(0, at);
        const caption = at === -1 ? '' : arg.slice(at + 1);
        shots.push({
            path,
            caption,
            before: before && { path: before },
        });
        before = null;
    }
}

if (!pr || !/^\d+$/.test(pr)) fail('pass the pull request number: --pr 153');
if (shots.length === 0) fail('pass at least one image path');
if (before) fail('--before must come just before the screenshot it pairs with');

/** Fails unless `path` is a readable image under the size limit; returns its extension. */
function checkImage(path) {
    let size;
    try {
        size = statSync(path).size;
    } catch {
        fail(`can't read ${path}`);
    }
    const ext = extname(path).toLowerCase();
    if (!IMAGE.test(ext)) fail(`${path} isn't a png, jpg, gif or webp`);
    if (size > MAX_BYTES) fail(`${path} is over 5 MB`);
    return ext;
}

const used = new Set();
for (const shot of shots) {
    const ext = checkImage(shot.path);
    // Name the file after its caption, so the branch reads well.
    const stem =
        (shot.caption || basename(shot.path, ext))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 60) || 'screenshot';
    let unique = stem;
    for (let n = 2; used.has(unique); n++) unique = `${stem}-${n}`;
    used.add(unique);
    if (shot.before) {
        shot.name = `${unique}-after${ext}`;
        shot.before.name = `${unique}-before${checkImage(shot.before.path)}`;
    } else {
        shot.name = `${unique}${ext}`;
    }
    shot.caption ||= basename(shot.path, ext);
}

// ---- Commit the images to the screenshots branch ------------------------------

const repo = run('gh', [
    'repo',
    'view',
    '--json',
    'nameWithOwner',
    '-q',
    '.nameWithOwner',
]);
const folder = `pr-${pr}`;

let parent = null;
try {
    run('git', [
        'fetch',
        '--quiet',
        'origin',
        `${BRANCH}:refs/remotes/origin/${BRANCH}`,
    ]);
    parent = run('git', ['rev-parse', `refs/remotes/origin/${BRANCH}`]);
} catch {
    // First use: the branch doesn't exist yet.
}

const scratch = mkdtempSync(join(tmpdir(), 'pr-screenshots-'));
const env = { ...process.env, GIT_INDEX_FILE: join(scratch, 'index') };
let commit = '(dry run)';
try {
    if (parent) run('git', ['read-tree', parent], { env });
    else run('git', ['read-tree', '--empty'], { env });

    const add = (path, blob) =>
        run(
            'git',
            ['update-index', '--add', '--cacheinfo', `100644,${blob},${path}`],
            {
                env,
            }
        );
    for (const [path, content] of Object.entries(BRANCH_FILES)) {
        const file = join(scratch, path);
        writeFileSync(file, content);
        add(path, run('git', ['hash-object', '-w', file]));
    }
    for (const image of shots.flatMap((shot) =>
        shot.before ? [shot.before, shot] : [shot]
    ))
        add(
            `${folder}/${image.name}`,
            run('git', ['hash-object', '-w', image.path])
        );

    const tree = run('git', ['write-tree'], { env });
    if (!dryRun) {
        commit = run('git', [
            'commit-tree',
            tree,
            ...(parent ? ['-p', parent] : []),
            '-m',
            `chore: screenshots for #${pr}`,
        ]);
        try {
            run('git', [
                'push',
                '--quiet',
                'origin',
                `${commit}:refs/heads/${BRANCH}`,
            ]);
        } catch (error) {
            fail(
                `push to ${BRANCH} was rejected (someone else pushed at the same time?). Run it again.\n${error.stderr ?? error.message}`
            );
        }
    }
} finally {
    rmSync(scratch, { recursive: true, force: true });
}

// ---- Update the description --------------------------------------------------

const url = (image) =>
    `https://raw.githubusercontent.com/${repo}/${commit}/${folder}/${encodeURIComponent(image.name)}`;
const escape = (text) =>
    text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const img = (image, alt, width) =>
    `<img src="${url(image)}" alt="${escape(alt)}"${width ? ` width="${width}"` : ''}>`;

function render(shot) {
    const phone = /^phone/i.test(shot.caption);
    if (!shot.before)
        return [
            `**${shot.caption}**`,
            '',
            img(shot, shot.caption, phone ? 360 : 800),
            '',
        ];
    // Side by side; on desktop shots GitHub scales each to half the width.
    return [
        `**${shot.caption}**`,
        '',
        '| Before (main) | After (this PR) |',
        '| --- | --- |',
        `| ${img(shot.before, `Before: ${shot.caption}`, phone ? 300 : 0)} | ${img(shot, `After: ${shot.caption}`, phone ? 300 : 0)} |`,
        '',
    ];
}
const section = [
    START,
    '## Screenshots',
    '',
    'From the local app with seeded test data.',
    '',
    ...shots.flatMap(render),
    END,
].join('\n');

if (dryRun) {
    console.log(section);
    process.exit(0);
}

const body = run('gh', ['pr', 'view', pr, '--json', 'body', '-q', '.body']);
let next;
if (body.includes(START) && body.includes(END)) {
    next =
        body.slice(0, body.indexOf(START)) +
        section +
        body.slice(body.indexOf(END) + END.length);
} else {
    // Before the attribution line if there is one, so it stays last.
    const footer = body.search(/\n🤖 Generated with/);
    next =
        footer === -1
            ? `${body}\n\n${section}\n`
            : `${body.slice(0, footer)}\n${section}\n${body.slice(footer)}`;
}
const bodyFile = join(mkdtempSync(join(tmpdir(), 'pr-body-')), 'body.md');
writeFileSync(bodyFile, next);
run('gh', ['pr', 'edit', pr, '--body-file', bodyFile]);
rmSync(bodyFile, { force: true });

console.log(
    `Added ${shots.length} screenshot(s) to #${pr} (${BRANCH} @ ${commit.slice(0, 8)}).`
);
