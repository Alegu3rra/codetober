import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/react';
import {AnswerChallengeDialog} from './AnswerChallengeDialog';
import {readAnswerFile,requestChallenge} from './api';
import type {AnswerChallenge} from '../../data/schema';

const config:AnswerChallenge={eventId:'demo',demo:true,endpoint:'http://127.0.0.1:8789/validator',opensAt:'2026-10-31T12:00:00Z',
  closesAt:'2026-11-01T12:00:00Z',archived:false,syncFailed:false,lastSyncedAt:null,
  problems:[{problemId:'demo-one',problemVersion:1,titleSlug:'final-answer'}]};
const catalog={eventId:'demo',demo:true,opensAt:config.opensAt,closesAt:config.closesAt,status:'open',
  problems:[{id:'demo-one',version:1,title:'Fictional final problem',statement:'Read your input and upload the answer.',maxFileBytes:524288}]};
beforeEach(()=>{
  HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
});
afterEach(()=>{vi.unstubAllGlobals();});

it('authenticates, uploads and reuses request UUID after lost confirmation without polling',async()=>{
  const bodies:unknown[]=[];let submissions=0;
  const fetcher=vi.fn(async(url:string,options?:RequestInit)=>{
    if(url.endsWith('/catalog'))return Response.json(catalog);
    if(url.endsWith('/access'))return Response.json({name:'Ada Fictional',demo:true,acceptances:[]});
    if(url.endsWith('/answer')) {
      submissions++;bodies.push(JSON.parse(options!.body as string));
      if(submissions===1)throw new Error('Connection lost; retry the same file.');
      return Response.json({status:'already-accepted',demo:true,acceptedAt:'2026-10-31T13:00:00Z'});
    }
    throw new Error('Unexpected call');
  });vi.stubGlobal('fetch',fetcher);
  render(<AnswerChallengeDialog config={config} titleSlug="final-answer" close={()=>{}}/>);
  await screen.findByText('Fictional final problem');expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText('Private access code'),{target:{value:'C'.repeat(43)}});
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));await screen.findByText('Ada Fictional');
  const file=new File(['A\n'],'answer.out',{type:'text/plain'});
  Object.defineProperty(file,'arrayBuffer',{value:async()=>new TextEncoder().encode('A\n').buffer});
  fireEvent.change(screen.getByLabelText(/Output file/),{target:{files:[file]}});
  await screen.findByText('answer.out');fireEvent.click(screen.getByRole('button',{name:'Submit answer'}));
  await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'Submit answer'}));
  await screen.findByText('Accepted');expect(bodies).toHaveLength(2);expect(bodies[0]).toEqual(bodies[1]);
  expect(fetcher.mock.calls.filter(([url])=>url.endsWith('/catalog'))).toHaveLength(1);
});

it('archived view makes no network requests',()=>{
  const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
  render(<AnswerChallengeDialog config={{...config,archived:true}} titleSlug="final-answer" statement="Archived statement remains available." close={()=>{}}/>);
  expect(screen.getByText('Archived statement remains available.')).toBeInTheDocument();
  expect(screen.getByText(/Results are preserved/)).toBeInTheDocument();expect(fetcher).not.toHaveBeenCalled();
});

it('fails closed on wrong event and requires verification in real mode',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json({...catalog,eventId:'other'})));
  const {unmount}=render(<AnswerChallengeDialog config={config} titleSlug="final-answer" close={()=>{}}/>);
  await screen.findByText(/configuration does not match/);expect(screen.queryByLabelText('Private access code')).not.toBeInTheDocument();unmount();
  vi.stubGlobal('fetch',vi.fn(async()=>Response.json({...catalog,demo:false})));
  render(<AnswerChallengeDialog config={{...config,demo:false}} titleSlug="final-answer" close={()=>{}}/>);
  await screen.findByLabelText('Private access code');expect(screen.getByRole('button',{name:'Continue'})).toBeDisabled();
});

it('rejects oversized and non UTF-8 files; requests omit cookies and administrative keys',async()=>{
  const large=new File(['x'],'large.out');Object.defineProperty(large,'size',{value:524289});
  await expect(readAnswerFile(large,524288)).rejects.toThrow('too large');
  const invalid=new File([''],'invalid.out');Object.defineProperty(invalid,'arrayBuffer',{value:async()=>new Uint8Array([255]).buffer});
  await expect(readAnswerFile(invalid,524288)).rejects.toThrow('UTF-8');
  const calls:RequestInit[]=[];
  vi.stubGlobal('fetch',vi.fn(async(_url:string,options:RequestInit)=>{calls.push(options);return Response.json({});}));
  await requestChallenge(config,'/access',{code:'C'.repeat(43)});
  expect(calls[0].credentials).toBe('omit');expect(calls[0].redirect).toBe('error');
  expect(calls[0].headers).not.toHaveProperty('X-Validator-Export-Key');
});
