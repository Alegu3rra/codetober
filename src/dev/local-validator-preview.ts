import {z} from 'zod';
import {challengePreviewData} from './challenge-preview-data';

const endpoint='http://127.0.0.1:8790/validator';
const instant=z.string().datetime({offset:true});
const catalogSchema=z.object({eventId:z.string().regex(/^[a-z0-9-]{1,80}$/),demo:z.literal(true),
  opensAt:instant,closesAt:instant,serverNow:instant,status:z.enum(['scheduled','open','closed']),
  problems:z.array(z.object({id:z.string().regex(/^[a-z0-9-]+$/),version:z.number().int().positive(),title:z.string(),statement:z.string().max(100000)})).length(1)});

// Development only. No statement, input, code or private bundle is copied into this repository.
export async function localValidatorPreview(signal:AbortSignal) {
  const response=await fetch(endpoint+'/catalog',{cache:'no-store',credentials:'omit',signal});
  if(!response.ok)throw new Error('Start the private local rehearsal API');
  const catalog=catalogSchema.parse(await response.json()),problem=catalog.problems[0];
  const data=structuredClone(challengePreviewData),last=data.days.at(-1)!;
  last.title='The final problem · Local rehearsal';
  last.description='Private local test with fictional participants and a temporary submission window.';
  last.releaseAt=catalog.opensAt;
  last.problems[1]={titleSlug:problem.id,title:problem.title,difficulty:'Easy',source:'answer-challenge',url:`#answer-${problem.id}`,statement:problem.statement};
  data.generatedAt=new Date(Math.max(Date.parse(catalog.serverNow),Date.parse('2026-10-31T13:00:00Z'))).toISOString();
  data.event.closeAt=catalog.closesAt;
  data.event.answerChallenge={eventId:catalog.eventId,endpoint,demo:true,opensAt:catalog.opensAt,closesAt:catalog.closesAt,
    archived:false,syncFailed:false,lastSyncedAt:null,problems:[{problemId:problem.id,problemVersion:problem.version,titleSlug:problem.id}]};
  for(const participant of data.participants)participant.results=participant.results.map(r=>r.titleSlug==='demo-potion-ledger'?{...r,titleSlug:problem.id}:r);
  return data;
}
