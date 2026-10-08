import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const snapshot = {
  version: 1, demo: true, generatedAt: '2026-10-02T14:00:00Z', lastSuccessfulSyncAt: '2026-10-02T14:00:00Z', participantsLastSuccessAt: '2026-10-02T14:00:00Z', participantsFailed: false,
  event: { timezone: 'America/Mexico_City', startAt: '2026-10-01T12:00:00Z', closeAt: '2026-11-01T12:00:00Z', totalProblems: 62,
    schedule: Array.from({ length: 31 }, (_, i) => { const date = `2026-10-${String(i + 1).padStart(2,'0')}`; return { date, releaseAt: `${date}T12:00:00Z` }; }) },
  days: [1,2].map(i => ({ id: `example-${i}`, date: `2026-10-0${i}`, title: `Example day ${i}`, description: `Practice the approach for example day ${i}.`, releaseAt: `2026-10-0${i}T12:00:00Z`,
    problems: [1,2].map(j => ({ titleSlug: `example-${i}-${j}`, title: `Example problem ${i}.${j}`, difficulty: j === 1 ? 'Easy' : 'Medium', url: `https://leetcode.com/problems/example-${i}-${j}/` })) })),
  participants: ['Amy','Bea','Charlie'].map((name, i) => ({ participant_id: `fictional-${i}`, display_name: `Example ${name}`, leetcode_username: `fictional_${name.toLowerCase()}`, rank: i < 2 ? 1 : 3,
    problemsCompleted: i < 2 ? 2 : 0, daysCompleted: i < 2 ? 1 : 0, currentStreak: i < 2 ? 1 : 0, bestStreak: i < 2 ? 1 : 0,
    lastSyncedAt: '2026-10-02T14:00:00Z', syncFailed: i === 2,
    results: [1,2].flatMap(day => [1,2].map(j => ({ titleSlug: `example-${day}-${j}`, firstAcceptedAt: i < 2 && day === 1 ? '2026-10-01T13:00:00Z' : null }))) })),
};
test('actual published snapshot loads under the project path without future content', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/codetober/2026/');
  await expect(page.getByRole('heading', { name: 'Problems', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  const response = await page.request.get('/codetober/2026/data/data.json');
  expect(response.ok()).toBe(true);
  const published = await response.json();
  expect(published.days.every((day: { releaseAt: string }) => Date.parse(day.releaseAt) <= Date.parse(published.generatedAt))).toBe(true);
  if (!published.days.length) await expect(page.getByText('No problems published yet. The first pair is on its way.')).toBeVisible();
});
test('published problems, ties, search, details, keyboard and accessibility', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-10-02T14:00:00Z') });
  await page.route('**/data/data.json', route => route.fulfill({ json: snapshot }));
  await page.goto('/codetober/2026/');
  await expect(page.getByRole('heading', { name: 'Today’s problems' })).toBeVisible();
  await expect(page.locator('.daily-focus')).toContainText('Practice the approach for example day 2.');
  await expect(page.getByRole('heading', { name: 'Example problem 2.1' })).toBeVisible();
  await page.locator('.archive-day > summary').filter({ hasText: 'Example day 1' }).click();
  await expect(page.getByRole('heading', { name: 'Example problem 1.1' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.getByRole('tab', { name: 'Problems' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Scoreboard' })).toBeFocused();
  await expect(page.getByLabel('Rank 1', { exact: true })).toHaveCount(1);
  await page.getByRole('searchbox').fill('FICTIONAL_AMY');
  await expect(page.getByRole('heading', { name: 'Example Amy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Example Bea' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Expand progress for Example Amy' }).click();
  await expect(page.getByText(/✓ Accepted/)).toHaveCount(2);
  await expect(page.getByText('— No accepted submission recorded', { exact: true })).toHaveCount(2);
  await page.getByText('View problem history · 4 problems').click();
  await expect(page.locator('.result-time').first()).toHaveText('1h 0m 0s');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('scoreboard.png'), fullPage: true });
  await page.getByRole('searchbox').fill('FICTIONAL_CHARLIE');
  await page.getByRole('button', { name: 'Expand progress for Example Charlie' }).click();
  const target = page.getByRole('region', { name: 'Next rank for Example Charlie' });
  await expect(target).toContainText('To reach #2, you need:');
  await expect(target).toContainText('Solve 2 more problems');
  await expect(target.getByRole('link')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'About ranking time' }).focus();
  await expect(page.getByRole('tooltip')).toContainText('including late penalties');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('rank-target.png'), fullPage: true });
  await page.getByRole('tab', { name: 'About / Join' }).click();
  await expect(page.getByText(/Hello, I’m Alejandra/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('05:59 countdown never reveals content and 06:00 waits for server publication', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-01T11:59:00Z') });
  await page.route('**/data/data.json', route => route.fulfill({ json: { ...snapshot, generatedAt: '2026-10-01T11:59:00Z', days: [], participants: [] } }));
  await page.goto('/codetober/2026/');
  await expect(page.getByText('00:01:00')).toBeVisible();
  await page.clock.fastForward('01:00');
  await expect(page.getByText('Awaiting publication')).toBeVisible();
  await expect(page.getByRole('link', { name: /Solve on LeetCode/ })).toHaveCount(0);
});
test('closed event retains archive and refresh failure retains loaded results', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-01T12:00:00Z') });
  let fail = false;
  await page.route('**/data/data.json', route => fail ? route.abort() : route.fulfill({ json: snapshot }));
  await page.goto('/codetober/2026/');
  await expect(page.getByText('EVENT CLOSED', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Problems', exact: true })).toBeVisible();
  fail = true; await page.clock.fastForward('01:01');
  await expect(page.getByRole('alert')).toContainText('Showing the last loaded snapshot.');
  await expect(page.locator('.archive-day > summary').filter({ hasText: 'Example day 1' })).toBeVisible();
});

 test('missing past edition shows the styled 404 on direct entry and reload', async ({ page }) => {
  await page.goto('/codetober/2025/');
  await expect(page.getByRole('heading', { name: '404 not found' })).toBeVisible();
  await expect(page.getByRole('banner')).toBeVisible();
  await page.reload();
  await expect(page.getByText('The 2025 edition is not available.')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test('unannounced editions redirect to the latest announced year', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-29T12:00:00Z') });
  await page.goto('/codetober/2099/?source=test#main');
  await expect(page).toHaveURL(/\/codetober\/2026\/\?source=test#main$/);
  await expect(page.getByRole('heading', { name: 'Problems', exact: true })).toBeVisible();
});
