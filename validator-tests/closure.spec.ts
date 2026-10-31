import {test,expect} from '@playwright/test';
test('closed preview keeps recognitions, archived dynamics, edition links and project journal without validator requests',async({page},testInfo)=>{
  const validatorCalls:string[]=[];
  page.on('request',request=>{if(/supabase\.co|127\.0\.0\.1:87(?:89|90)/.test(request.url()))validatorCalls.push(request.url());});
  await page.goto('/codetober/2026/?preview=closed');
  await expect(page.getByRole('heading',{name:'The month ends. Your progress stays.'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Discover Make a Wish'})).toHaveCount(0);
  await expect(page.getByRole('tab',{name:'Make a Wish'})).toHaveCount(0);
  await page.getByLabel('Open edition archive').click();
  const archive=page.getByRole('navigation',{name:'Browse past editions'});
  await expect(archive).toBeVisible();await expect(archive.getByRole('link',{name:/Codetober 2026/})).toHaveAttribute('href',/\/2026\//);
  await page.keyboard.press('Escape');await expect(archive).not.toBeVisible();
  await page.getByText('Event memories · Make a Wish & Extraordinarios',{exact:true}).click();
  await expect(page.getByRole('heading',{name:'Make a Wish',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('closed.png')});
  async function tab(name:string){const menu=page.getByRole('button',{name:'Toggle navigation menu'});if(await menu.isVisible())await menu.click();await page.getByRole('tab',{name,exact:true}).click();}
  await tab('Scoreboard');await expect(page.getByRole('button',{name:/Codetober Finisher/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Past Halfway/})).toBeVisible();await expect(page.getByRole('button',{name:/Took Part/})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('recognitions.png')});
  await tab('Project journal');await expect(page.getByRole('heading',{name:'Project journal'})).toBeVisible();
  await page.locator('summary').filter({hasText:'An answer-only judge proof of concept'}).click();
  await expect(page.getByText(/Running untrusted code safely needs/)).toBeVisible();
  expect(validatorCalls).toEqual([]);
});
