import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Sunday preview shows both dynamics, accessible wish dialogs, copy choices and no overflow', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/codetober/2026/?preview=wish#make-a-wish');
  await expect(page.getByRole('heading', { name: 'Make a Wish', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Extraordinarios: rules and pending problems' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discover Make a Wish' })).toBeVisible();
  const card = page.getByRole('button', { name: /01.*One More Spell/ });
  await card.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('−2h per extra problem', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Copy email', exact: true }).click();
  await expect(dialog.getByRole('status')).toHaveText('Email address copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('alegu3rra@gmail.com');
  await dialog.getByRole('button', { name: 'Copy choice template' }).click();
  await expect(dialog.getByRole('status')).toHaveText('Message template copied.');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Subject: Codetober 2026 · Make a Wish · One More Spell');
  expect(copied).toContain('LeetCode username:');
  await expect(page.locator('#make-a-wish a[href^="mailto:"]')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `../output/make-a-wish-modal-${testInfo.project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(card).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `../output/make-a-wish-${testInfo.project.name}.png`, fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Fairy dust: on' }).click();
  await expect(page.getByRole('button', { name: 'Fairy dust: off' })).toBeVisible();
});

test('blocked clipboard exposes selectable text for manual copying', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Clipboard unavailable'); } } }));
  await page.goto('/codetober/2026/?preview=wish#make-a-wish');
  await page.getByRole('button', { name: /01.*One More Spell/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Copy email', exact: true }).click();
  const text = dialog.getByRole('textbox', { name: 'Choice email text' });
  await expect(text).toBeVisible(); await expect(text).toHaveValue('alegu3rra@gmail.com');
  await expect(text).toBeFocused();
  await dialog.getByRole('button', { name: 'Copy choice template' }).click();
  await expect(text).toHaveValue(/My choice or proposal: One More Spell/);
});

test('announced preview hides Sunday problems and lets both banners navigate to their tabs', async ({ page }, testInfo) => {
  await page.goto('/codetober/2026/?preview=wish-upcoming#make-a-wish');
  await expect(page.getByText('Both problems will be revealed', { exact: false })).toBeVisible();
  await expect(page.locator('.wish-problems a')).toHaveCount(0);
  await page.getByRole('link', { name: 'View Extraordinarios: rules and pending problems' }).click();
  await expect(page.getByRole('heading', { name: 'Overdue problems by participant' })).toBeVisible();
  await page.screenshot({ path: `../output/extraordinarios-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Discover Make a Wish' }).click();
  await expect(page.getByRole('heading', { name: 'Make a Wish', exact: true })).toBeVisible();
});

test('exact ties and confirmed winners have distinct states after the window closes', async ({ page }) => {
  await page.goto('/codetober/2026/?preview=wish-tie#make-a-wish');
  await expect(page.getByRole('heading', { name: 'Result under review' })).toBeVisible();
  await expect(page.getByText(/An exact tie was recorded/)).toBeVisible();
  await page.goto('/codetober/2026/?preview=wish-winner#make-a-wish');
  await expect(page.getByRole('heading', { name: 'Winner confirmed' })).toBeVisible();
  await expect(page.getByLabel('Make a Wish result')).toContainText('Golden Example');
});

test('reduced motion disables the wand and dust', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/codetober/2026/?preview=wish#make-a-wish');
  await expect(page.getByRole('heading', { name: 'Make a Wish', exact: true })).toBeVisible();
  expect(await page.locator('#make-a-wish').evaluate(el => getComputedStyle(el).cursor)).not.toContain('data:image');
  await expect(page.locator('.fairy-dust')).toBeHidden();
});
