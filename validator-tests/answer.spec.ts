import {test,expect} from '@playwright/test';
test('single final challenge: download, file submission, safe retry, acceptance and close',async({page},testInfo)=>{
  const requests:{requestId:string;answer:string}[]=[];let catalogCalls=0;
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('http://127.0.0.1:8789/validator/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}});return;}
    if(path.endsWith('/catalog')) {catalogCalls++;await route.fulfill({json:{eventId:'demo-final-2026',demo:true,
      opensAt:'2026-10-31T12:00:00Z',closesAt:'2026-11-01T12:00:00Z',status:'open',
      problems:[{id:'demo-numbers',version:1,title:'Ordered numbers · Demo',statement:'# Your final challenge\n\n'+Array.from({length:24},(_,i)=>`Instruction ${i+1}: use your assigned input. Upload one answer per line.`).join('\n\n'),maxFileBytes:524288}]}});return;}
    expect(route.request().headers().authorization).toBe('Bearer '+'C'.repeat(43));
    if(path.endsWith('/access')) {await route.fulfill({json:{name:'Ada Example',demo:true,acceptances:[]}});return;}
    if(path.endsWith('/input')) {await route.fulfill({contentType:'text/plain',body:'3 1\nA 10\nB 20\nC 30\n20\n'});return;}
    if(path.endsWith('/answer')) {
      requests.push(route.request().postDataJSON());
      if(requests.length===1){await route.abort('failed');return;}
      await route.fulfill({json:{status:'already-accepted',acceptedAt:'2026-10-31T13:00:00Z',demo:true}});return;
    }
    throw new Error('Unexpected validator route');
  });
  await page.goto('/codetober/2026/?preview=wish-validator');
  const open=page.getByRole('button',{name:'Open final challenge →'});await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('heading',{name:'Ordered numbers · Demo'})).toBeVisible();
  const closeControl=page.getByRole('button',{name:'Close answer challenge'});
  const closeBefore=await closeControl.boundingBox();
  await page.getByLabel('Private access code').fill('C'.repeat(43));await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByText('Ada Example')).toBeVisible();
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download my input'}).click();
  expect((await downloaded).suggestedFilename()).toBe('demo-numbers-input.txt');
  const chooser=page.waitForEvent('filechooser');await page.getByLabel(/Output file/).click();
  await (await chooser).setFiles({name:'answer.out',mimeType:'text/plain',buffer:Buffer.from('B\nMi_problema_favorito_fue: Example\n')});
  await expect(page.getByText('answer.out',{exact:true})).toHaveCount(1);
  const closeAfter=await closeControl.boundingBox();
  expect(Math.abs(closeBefore!.x-closeAfter!.x)).toBeLessThan(1);expect(Math.abs(closeBefore!.y-closeAfter!.y)).toBeLessThan(1);
  const icon=await closeControl.locator('svg').boundingBox();
  expect(Math.abs(icon!.x+icon!.width/2-closeAfter!.x-closeAfter!.width/2)).toBeLessThan(1);
  expect(Math.abs(icon!.y+icon!.height/2-closeAfter!.y-closeAfter!.height/2)).toBeLessThan(1);
  await page.screenshot({path:testInfo.outputPath('file-picker.png')});
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByText('Accepted',{exact:true})).toBeVisible();
  expect(requests).toHaveLength(2);expect(requests[0]).toEqual(requests[1]);expect(catalogCalls).toBe(1);expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('accepted.png'),fullPage:true});
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(open).toBeFocused();
});
