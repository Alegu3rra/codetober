import { expect, test } from 'vitest';
import { annualRegistry, releaseInstant, type Registry } from '../shared/annual-editions.mjs';
const source: Registry = {automaticAnnualCycle:true, latestYear:2026, editions:[{
  year:2026, announced:true, startAt:'2026-10-01T06:00:00-06:00', closeAt:'2026-11-01T06:00:00-06:00',
  registrationUrl:'https://forms.gle/2026-only', registrationCloseAt:'2026-10-31T00:00:00-06:00', snapshot:'data/data.json',
}]};
const at = (date:string) => annualRegistry(source, Date.parse(date));
test('first edition is 2026; closure at 06:00 announces the following year, never 05:59', () => {
  expect(at('2025-11-01T12:00:00Z').latestYear).toBe(2026);
  expect(at('2026-11-01T11:59:59Z').latestYear).toBe(2026);
  const after = at('2026-11-01T12:00:00Z');
  expect(after.latestYear).toBe(2027);
  expect(after.editions.map(e => e.year)).toEqual([2026,2027]);
  expect(after.editions[1].startAt).toBe('2027-10-01T12:00:00.000Z');
});
test('January and October retain the same edition; subsequent closures repeat indefinitely', () => {
  for (const date of ['2027-01-01T00:00:00Z','2027-10-01T11:59:59Z','2027-10-01T12:00:00Z','2027-11-01T11:59:59Z']) {
    expect(at(date).latestYear).toBe(2027);
  }
  expect(at('2027-11-01T12:00:00Z').latestYear).toBe(2028);
  expect(at('2030-11-03T12:00:00Z').editions.map(e => e.year)).toEqual([2026,2027,2028,2029,2030,2031]);
});
test('new years inherit no participants snapshot or registration; old configuration is preserved', () => {
  const result = at('2027-11-01T12:00:00Z');
  expect(result.editions[0].snapshot).toBe('data/data.json');
  for (const edition of result.editions.slice(1)) {
    expect(edition.snapshot).toBeNull();
    expect(edition.registrationUrl).toBeNull();
    expect(edition.registrationCloseAt).toBeNull();
  }
  expect(source.editions).toHaveLength(1);
  expect(source.latestYear).toBe(2026);
});
test('each configured year keeps its own form and sanitized snapshot when due', () => {
  const registry = structuredClone(source);
  registry.editions.push({...source.editions[0],year:2028,registrationUrl:'https://forms.gle/2028-only',snapshot:'data/2028/data.json'});
  expect(annualRegistry(registry, Date.parse('2026-11-01T12:00:00Z')).editions).toHaveLength(2);
  const result = annualRegistry(registry, Date.parse('2027-11-01T12:00:00Z'));
  expect(result.editions[2].snapshot).toBe('data/2028/data.json');
  expect(result.editions[2].startAt).toBe(releaseInstant(2028,10));
});
test('repeat builds at the same instant are idempotent; invalid dates fail', () => {
  expect(at('2030-11-02T12:00:00Z')).toEqual(at('2030-11-02T12:00:00Z'));
  expect(() => annualRegistry(source,NaN)).toThrow();
});
