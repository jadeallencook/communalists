#!/usr/bin/env node
// Looks up the app's GeoNames place IDs for the organizations CSV.
//   node .claude/skills/prepare-organizations-csv/find-place.mjs "San Jose" CA
// Prints id, city, state and population for every city that matches (best first).
// Reads src/lib/places/data/us.json, the same file the app checks against.

import { readFileSync } from 'node:fs';

const [query, state] = process.argv.slice(2);
if (!query) {
    console.error('Usage: find-place.mjs "<city>" [state code, e.g. CA]');
    process.exit(1);
}
const data = JSON.parse(
    readFileSync(
        new URL('../../../src/lib/places/data/us.json', import.meta.url)
    )
);
const regions = data.regions;
const fold = (s) =>
    s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const q = fold(query);
const matches = data.places
    .filter(([, name, region]) => {
        if (state && region !== state.toUpperCase()) return false;
        return fold(name) === q || fold(name).startsWith(q);
    })
    .sort((a, b) => (fold(b[1]) === q) - (fold(a[1]) === q) || b[5] - a[5])
    .slice(0, 10);
if (matches.length === 0) {
    console.log('No match. Try a nearby larger city, or check the spelling.');
    process.exit(2);
}
for (const [id, name, region, , , population] of matches)
    console.log(
        `${id}\t${name}, ${regions[region] ?? region}\tpopulation ${population}`
    );
