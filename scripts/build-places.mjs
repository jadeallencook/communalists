// Builds src/lib/places/data/<country>.json from GeoNames.
//
//   curl -O https://download.geonames.org/export/dump/cities500.zip && unzip cities500.zip
//   curl -O https://download.geonames.org/export/dump/admin1CodesASCII.txt
//   node scripts/build-places.mjs <dir with those files> US
//
// GeoNames data is CC BY 4.0 (https://www.geonames.org/): credit it wherever
// places are shown (the sign-up form does). Re-run to refresh the data.
import fs from 'node:fs';
import path from 'node:path';

const [dir, country = 'US'] = process.argv.slice(2);
if (!dir) {
    console.error(
        'Usage: node scripts/build-places.mjs <geonames dir> [COUNTRY]'
    );
    process.exit(1);
}

// Populated places people live in. Excludes PPLX (neighborhoods / sections of
// a city), PPLQ (abandoned), PPLH (historical), PPLW (destroyed).
const KEEP = new Set([
    'PPL',
    'PPLA',
    'PPLA2',
    'PPLA3',
    'PPLA4',
    'PPLC',
    'PPLG',
    'PPLL',
    'PPLS',
]);
const round = (n) => Math.round(Number(n) * 100) / 100; // ~1 km

const regions = {};
for (const line of fs
    .readFileSync(path.join(dir, 'admin1CodesASCII.txt'), 'utf8')
    .split('\n')) {
    const [code, name] = line.split('\t');
    if (code?.startsWith(`${country}.`)) regions[code.split('.')[1]] = name;
}

// One entry per name within a region: keep the most populous.
const best = new Map();
for (const line of fs
    .readFileSync(path.join(dir, 'cities500.txt'), 'utf8')
    .split('\n')) {
    const f = line.split('\t');
    if (f[8] !== country || !KEEP.has(f[7]) || !regions[f[10]]) continue;
    const place = {
        id: Number(f[0]),
        name: f[1],
        region: f[10],
        lat: round(f[4]),
        lng: round(f[5]),
        population: Number(f[14]) || 0,
    };
    const key = `${place.name.toLowerCase()}|${place.region}`;
    if (!best.has(key) || best.get(key).population < place.population)
        best.set(key, place);
}

// Most populous first, so search results are already in a sensible order.
const places = [...best.values()].sort((a, b) => b.population - a.population);
const out = {
    source: 'GeoNames cities500 (CC BY 4.0, https://www.geonames.org/)',
    generated: new Date().toISOString().slice(0, 10),
    country,
    regions,
    // [geonameId, name, regionCode, lat, lng, population]
    places: places.map((p) => [
        p.id,
        p.name,
        p.region,
        p.lat,
        p.lng,
        p.population,
    ]),
};

const file = path.join('src/lib/places/data', `${country.toLowerCase()}.json`);
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out) + '\n');
console.log(
    `${file}: ${places.length} places, ${Object.keys(regions).length} regions, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`
);
