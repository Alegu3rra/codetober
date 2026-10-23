import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wishes = [
  ['one-more-spell', 'One More Spell'], ['second-chance', 'Second Chance'],
  ['spellbook-unlocked', 'Spellbook Unlocked'], ['the-final-quest', 'The Final Quest'],
  ['choose-the-last-problem', 'Choose the Last Problem'],
];

for (const [id, title] of wishes) {
  test(`${title}: stays within the challenge layout`, async ({ page }, info) => {
    await page.goto(`/codetober/2026/?preview=wish-design&wish=${id}#problems`);
    await expect(page.getByRole('heading', { name: 'Today’s problems' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compare Your Approaches', exact: true })).toBeVisible();
    await expect(page.getByText('Try it first.', { exact: false }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('searchbox', { name: 'Find a wish participant' })).toHaveCount(0);
    const daily = page.getByRole('complementary', { name: 'Optional daily bonus spell' });
    if (id === 'one-more-spell') {
      await expect(daily).toBeVisible();
      await expect(daily.getByRole('heading', { name: 'A Trail of Starlight' })).toBeVisible();
      expect(await page.locator('.problems').first().evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThan(await daily.evaluate(el => el.getBoundingClientRect().top));
      await daily.getByRole('button', { name: 'Open bonus problem →' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    } else await expect(daily).toHaveCount(0);
    if (id === 'second-chance' || id === 'the-final-quest') {
      await expect(page.locator('.activation-mission')).toHaveCount(0);
      await expect(page.getByText('The Lantern Keeper', { exact: true })).toHaveCount(0);
    }
    if (id === 'spellbook-unlocked') {
      const first = page.locator('.problems').first().locator('.problem').first();
      await first.getByRole('button', { name: 'Reveal first hint' }).click();
      await expect(first.getByText('HINT 1', { exact: true })).toBeVisible();
      await first.getByRole('button', { name: 'Reveal next hint' }).click();
      await first.getByRole('button', { name: 'Reveal next hint' }).click();
      await expect(first.getByRole('button', { name: 'All hints revealed' })).toBeDisabled();
      await expect(page.locator('.problems').first().locator('.problem').nth(1).getByRole('button', { name: 'Reveal first hint' })).toBeVisible();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `../output/wish-design-${id}-problems-${info.project.name}.png`, fullPage: true });
    await page.getByRole('tab', { name: 'Make a Wish', exact: true }).click();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    if (id === 'one-more-spell') {
      const archive = page.locator('.wish-daily-archive');
      for (const summary of await archive.locator('summary').all()) {
        const titleBox = await summary.locator('.wish-day-title').boundingBox();
        const rewardBox = await summary.locator('.wish-reward').boundingBox();
        expect(titleBox && rewardBox && (rewardBox.x >= titleBox.x + titleBox.width + 8 || rewardBox.y >= titleBox.y + titleBox.height + 4)).toBeTruthy();
      }
      await archive.locator('summary').first().click();
      await expect(archive.locator('.activation-mission').first()).toBeVisible();
    }
    if (id !== 'spellbook-unlocked' && id !== 'choose-the-last-problem') {
      await expect(page.getByRole('combobox', { name: 'View participant progress' })).toHaveCount(0);
      await expect(page.locator('.wish-progress-entry')).toHaveCount(3);
      await page.getByRole('searchbox', { name: 'Find a wish participant' }).fill('Golden');
      await expect(page.locator('.wish-progress-entry')).toHaveCount(1);
      await page.locator('.wish-progress-entry summary').click();
      await expect(page.locator('.wish-progress-detail')).toBeVisible();
      await page.getByRole('searchbox', { name: 'Find a wish participant' }).fill('');
      if (id === 'the-final-quest') {
        await expect(page.locator('.activation-missions > article')).toHaveCount(3);
        await page.getByLabel('Example accepted').selectOption('3');
      }
    } else if (id === 'choose-the-last-problem') {
      await page.getByLabel('Stage', { exact: true }).selectOption('scheduled');
      await expect(page.getByRole('heading', { name: 'One last secret' })).toBeVisible();
      await expect(page.getByText('The Last Lantern', { exact: true })).toHaveCount(0);
      await page.getByLabel('Stage', { exact: true }).selectOption('closed');
      await page.getByText('Read the winner’s editorial', { exact: true }).click();
      await expect(page.getByText('No additional editorial credit is awarded for this contribution.')).toBeVisible();
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `../output/wish-design-${id}-${info.project.name}.png`, fullPage: true });
    await page.getByRole('tab', { name: 'Scoreboard', exact: true }).click();
    // The collapsed row keeps the existing Problems / Current streak structure.
    await expect(page.locator('.participant').first().locator('.wish-stat')).toBeHidden();
    await page.getByRole('button', { name: 'Expand progress for Golden Example' }).click();
    const detail = page.locator('.participant').filter({ hasText: 'Golden Example' }).first();
    if (id !== 'spellbook-unlocked' && id !== 'choose-the-last-problem') {
      await expect(detail.locator('.wish-stat')).toBeVisible();
      await detail.getByText(/View problem history/).click();
      await expect(detail.locator('.wish-history-result').first()).toBeVisible();
      await expect(detail.locator('.wish-history-result').first()).toContainText('Credit awarded once');
      if (id === 'the-final-quest') {
        await expect(detail.locator('.wish-stat')).toContainText('−6h');
        await expect(detail.locator('.wish-history-result')).toHaveCount(3);
      }
    } else await expect(detail.locator('.wish-stat')).toHaveCount(0);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `../output/wish-design-${id}-scoreboard-${info.project.name}.png`, fullPage: true });
  });
}

test('full navigation and selector keep the current challenge structure', async ({ page }) => {
  await page.goto('/codetober/2026/?preview=wish-design');
  await page.getByLabel('Wish', { exact: true }).selectOption('spellbook-unlocked');
  await page.getByRole('tab', { name: 'Make a Wish', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Spellbook Unlocked', exact: true })).toBeVisible();
  const tab = page.getByRole('tab', { name: 'Make a Wish', exact: true });
  await tab.focus(); await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Problems', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Today’s problems' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Editorials', exact: true })).toBeVisible();
});
