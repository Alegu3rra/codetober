import { afterEach, expect, test } from "vitest";
import { editions, previousEdition, emptyEditionData } from "./editions";
import { resolveRoute } from "./routing";
const initialLength = editions.length;
afterEach(() => { editions.splice(initialLength); });
test("only announced years are available; New Year does not announce a contest", () => {
  expect(editions.map(e => e.year)).toEqual([2026]);
  expect(resolveRoute('/codetober/', '/codetober/2026/').currentPath).toBe('/codetober/2026/');
  expect(resolveRoute('/codetober/2027/', '/codetober/2026/').kind).toBe('redirect');
});
test("previous edition shortcut is hidden during any active contest", () => {
  // Test the prepared second edition as though it had been announced.
  editions.push({ ...editions[0], year: 2027, startAt:'2027-10-01T06:00:00-06:00', closeAt:'2027-11-01T06:00:00-06:00' });
  expect(previousEdition(Date.parse('2027-10-01T12:00:00Z'))).toBeUndefined();
  expect(resolveRoute('/codetober/2027/', '/codetober/2026/', 2027).kind).toBe('edition');
});
test("a waiting edition has no participants, results, problems or previous sync dates", () => {
  const data = emptyEditionData();
  expect(data.days).toEqual([]);
  expect(data.participants).toEqual([]);
  expect(data.lastSuccessfulSyncAt).toBeNull();
  expect(data.event.schedule).toHaveLength(31);
});
