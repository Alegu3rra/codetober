import {afterEach,expect,it,vi} from 'vitest';
import {localValidatorPreview} from './local-validator-preview';
import {dataSchema} from '../data/schema';

const catalog={eventId:'local-demo-test',demo:true,opensAt:'2026-10-30T20:00:00Z',closesAt:'2026-11-01T20:00:00Z',serverNow:'2026-10-30T20:01:00Z',status:'open',
  problems:[{id:'sealed-test-problem',version:2,title:'Private local test',statement:'A fictional statement returned by the local API.'}]};
afterEach(()=>vi.unstubAllGlobals());
it('loads a demo catalog only from fixed loopback and produces a valid fictional snapshot',async()=>{
  const fetcher=vi.fn(async(_url:string,_options?:RequestInit)=>Response.json(catalog));vi.stubGlobal('fetch',fetcher);
  const data=dataSchema.parse(await localValidatorPreview(new AbortController().signal));
  expect(fetcher).toHaveBeenCalledTimes(1);expect(fetcher.mock.calls[0][0]).toBe('http://127.0.0.1:8790/validator/catalog');
  expect(data.event.answerChallenge?.demo).toBe(true);expect(data.days.at(-1)?.problems[1].statement).toBe(catalog.problems[0].statement);
  expect(data.participants.every(p=>p.results.every(r=>r.titleSlug!=='demo-potion-ledger'))).toBe(true);
});
it('refuses real or unavailable backends in the local-only preview',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json({...catalog,demo:false})));
  await expect(localValidatorPreview(new AbortController().signal)).rejects.toThrow();
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:503})));
  await expect(localValidatorPreview(new AbortController().signal)).rejects.toThrow('local rehearsal API');
});
