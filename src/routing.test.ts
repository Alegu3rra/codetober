import { expect, test } from "vitest";
import { currentYear, resolveRoute } from "./routing";

const base = '/codetober/2026/';
test('the active edition supports direct URLs and trailing slashes', () => {
  for (const path of [base, '/codetober/2026', `${base}index.html`]) {
    expect(resolveRoute(path, base, 2026).kind).toBe('edition');
  }
});
test('missing previous editions and invalid pages are not current results', () => {
  for (const path of ['/codetober/2025/', '/codetober/2026/missing', '/codetober/nope', '/elsewhere/2026']) {
    expect(resolveRoute(path, base, 2026).kind).toBe('not-found');
  }
});
test('future editions and site root redirect to the calendar year', () => {
  for (const path of ['/', '/codetober', '/codetober/', '/codetober/index.html', '/codetober/2099/', '/codetober/2027']) {
    expect(resolveRoute(path, base, 2026)).toEqual({ kind: 'redirect', currentPath: base });
  }
  expect(resolveRoute('/codetober/2099', base, 2027).currentPath).toBe('/codetober/2027/');
  expect(resolveRoute('/', base, 2027).currentPath).toBe('/codetober/2027/');
  expect(resolveRoute('/codetober/', base, 2027).currentPath).toBe('/codetober/2027/');
  expect(resolveRoute('/codetober/2027/', base, 2027).kind).toBe('not-found');
  expect(resolveRoute('/codetober/2026/', base, 2027).kind).toBe('edition');
});
test('custom repository and domain paths work', () => {
  expect(resolveRoute('/challenge/2028/', '/challenge/2026/', 2026).currentPath).toBe('/challenge/2026/');
  expect(resolveRoute('/2099/', '/2026/', 2026).currentPath).toBe('/2026/');
  expect(resolveRoute('/', '/2026/', 2026)).toEqual({ kind: 'redirect', currentPath: '/2026/' });
});
test('the calendar year uses the event timezone at New Year', () => {
  expect(currentYear(new Date('2027-01-01T02:00:00Z'))).toBe(2026);
  expect(currentYear(new Date('2027-01-01T12:00:00Z'))).toBe(2027);
});
