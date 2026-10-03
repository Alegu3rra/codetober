import { readFile, writeFile } from 'node:fs/promises';
const path = 'src/editions.json';
const registry = JSON.parse(await readFile(path, 'utf8'));
if (registry.automaticAnnualCycle) {
  console.log('Annual announcements are automatic at the previous contest close. Run build:pages to prepare the currently due editions.');
  process.exit(0);
}
const year = Number(process.argv[2]);
const next = registry.editions.find(e => e.year === year);
const current = registry.editions.find(e => e.year === registry.latestYear);
if (!next || year <= registry.latestYear) throw new Error('Choose a prepared later edition');
if (Date.now() < Date.parse(current.closeAt)) throw new Error('Wait until the current contest closes before announcing the next edition');
next.announced = true;
registry.latestYear = year;
await writeFile(path, JSON.stringify(registry, null, 2) + '\n');
console.log(`Edition ${year} announced locally. Review, build and commit to publish.`);
