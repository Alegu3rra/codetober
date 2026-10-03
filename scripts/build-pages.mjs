import { annualRegistry } from '../shared/annual-editions.mjs';
import { readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
// Share one timestamp across all builds, including a run crossing the close boundary.
const buildTime = Date.now();
process.env.CODETOBER_BUILD_TIME = String(buildTime);
const registry = annualRegistry(JSON.parse(await readFile('src/editions.json', 'utf8')), buildTime);
const editions = registry.editions.filter(e => e.announced);
if (!editions.some(e => e.year === registry.latestYear)) throw new Error('Latest edition must be announced');
const latest = editions.find(e => e.year === registry.latestYear);
if (editions.some(e => e.year < latest.year && buildTime < Date.parse(e.closeAt))) throw new Error('Previous contest must close before announcing its successor');
const root = process.env.REPOSITORY_NAME || 'codetober';
if (!/^[a-zA-Z0-9._-]+$/.test(root)) throw new Error('Invalid repository name');
await rm('_site', {recursive:true, force:true});
await mkdir('_site');
execFileSync('npx', ['tsc','--noEmit'], {stdio:'inherit'});
for (const edition of editions) {
  execFileSync('npx', ['vite','build',`--base=/${root}/${edition.year}/`], {stdio:'inherit'});
  // Do not copy another year's snapshots into this edition.
  await rm('dist/data', {recursive:true, force:true});
  if (edition.snapshot) {
    const source = JSON.parse(await readFile(`public/${edition.snapshot}`, 'utf8'));
    if (Date.parse(source.event.startAt) !== Date.parse(edition.startAt)
      || Date.parse(source.event.closeAt) !== Date.parse(edition.closeAt)) throw new Error('Wrong edition snapshot');
    await mkdir(`dist/${edition.snapshot.substring(0,edition.snapshot.lastIndexOf('/'))}`, {recursive:true});
    await cp(`public/${edition.snapshot}`, `dist/${edition.snapshot}`);
  }
  let html = await readFile('dist/index.html','utf8');
  if (edition.year !== 2026) {
    // Until a new share image exists, omit the old year's image metadata.
    html = html.split('\n').filter(line => !/property="og:image|name="twitter:image/.test(line)).join('\n')
      .replaceAll('Codetober 2026', `Codetober ${edition.year}`)
      .replaceAll('/codetober/2026/', `/${root}/${edition.year}/`)
      .replace('summary_large_image','summary');
  }
  await writeFile('dist/index.html', html);
  await cp('dist', `_site/${edition.year}`, {recursive:true});
  if (edition.year === registry.latestYear) {
    await writeFile('_site/index.html', html);
    await writeFile('_site/404.html', html);
  }
}
