// Lists the cities in an area, most populous first, so a search covers each
// one ("mutual aid <city>") instead of only the big city in the middle.
//   pnpm exec tsx --conditions=react-server .claude/skills/find-organizations/area.ts 5392171 25
// Arguments: a place ID (from prepare-organizations-csv/find-place.mjs), a
// radius in miles (default 25), and optionally a minimum population
// (default 5000). Reads the app's own place data (src/lib/places).

import { distanceMiles } from '@/lib/organizations/directory';
import { getPlace } from '@/lib/places';
import usPlaces from '@/lib/places/data/us.json';
import type { PlaceDataset } from '@/lib/places/types';

const [placeId, milesArg = '25', minArg = '5000'] = process.argv.slice(2);
const miles = Number(milesArg);
const minPopulation = Number(minArg);
const center = placeId ? getPlace('US', placeId) : undefined;
if (!center || !(miles > 0) || !(minPopulation >= 0)) {
    console.error(
        'Usage: area.ts <placeId> [miles=25] [minPopulation=5000]\n' +
            'Find the place ID with prepare-organizations-csv/find-place.mjs.'
    );
    process.exit(1);
}

const data = usPlaces as unknown as PlaceDataset;
const inArea = data.places
    .map(([id, name, region, lat, lng, population]) => ({
        id: String(id),
        label: `${name}, ${data.regions[region] ?? region}`,
        population,
        miles: distanceMiles(center, { lat, lng }),
    }))
    .filter((p) => p.miles <= miles && p.population >= minPopulation)
    .sort((a, b) => b.population - a.population);

console.log(
    `${inArea.length} cities within ${miles} miles of ${center.label}` +
        ` (population ${minPopulation} or more):`
);
for (const p of inArea)
    console.log(
        `${p.id}\t${p.label}\t${Math.round(p.miles)} mi\tpopulation ${p.population}`
    );
