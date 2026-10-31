import {challengePreviewData} from './challenge-preview-data';
export const validatorPreviewData=structuredClone(challengePreviewData);
const last=validatorPreviewData.days.at(-1)!;
last.problems[1]={titleSlug:'demo-numbers',title:'Ordered numbers · Test problem',difficulty:'Easy',source:'answer-challenge',url:'#answer-demo-numbers'};
validatorPreviewData.event.answerChallenge={eventId:'demo-final-2026',demo:true,endpoint:'http://127.0.0.1:8789/validator',
  opensAt:'2026-10-31T12:00:00Z',closesAt:'2026-11-01T12:00:00Z',archived:false,syncFailed:false,lastSyncedAt:null,
  problems:[{problemId:'demo-numbers',problemVersion:1,titleSlug:'demo-numbers'}]};
for(const person of validatorPreviewData.participants) {
  person.results=person.results.map(r=>r.titleSlug==='demo-potion-ledger'?{...r,titleSlug:'demo-numbers'}:r);
}
