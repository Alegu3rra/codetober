import { z } from 'zod';
import type { AnswerChallenge } from '../../data/schema';

const instant=z.string().datetime({offset:true});
export const catalogSchema=z.object({eventId:z.string(),demo:z.boolean(),opensAt:instant,closesAt:instant,
  status:z.enum(['scheduled','open','closed']),problems:z.array(z.object({id:z.string(),version:z.number(),title:z.string(),
    statement:z.string().max(100000),maxFileBytes:z.number().int().positive().max(524288)}))});
export const accessSchema=z.object({name:z.string(),demo:z.boolean(),acceptances:z.array(z.object({problemId:z.string(),acceptedAt:instant}))});
export const resultSchema=z.object({status:z.enum(['correct','incorrect','already-accepted']),acceptedAt:instant.nullable().optional(),retryAfter:z.number().optional(),demo:z.boolean(),favoriteRecorded:z.boolean().optional()});
const messages:Record<string,string>={
  'invalid-access':'That code is invalid, expired or has been replaced. Check your email or contact the organizer.',
  'not-open':'The submission window has not opened.',closed:'The submission window has closed.',
  paused:'Submissions are temporarily unavailable. Contact the organizer if the window is closing.',
  cooldown:'Please wait before submitting again.','rate-limit':'Too many requests. Please wait before retrying.',
  'attempt-limit':'The attempt limit has been reached. Contact the organizer.',
  'download-limit':'Please wait before downloading again. Contact the organizer if the limit has been reached.',
  'challenge-required':'Complete the verification and try again.','request-conflict':'This retry conflicts with an earlier attempt. Select the file again.',
};
export class ChallengeError extends Error {
  constructor(public status:string,public retryAfter=0) {super(messages[status]??'The request could not be confirmed. Retry shortly or contact the organizer.');}
}
export async function requestChallenge(config:AnswerChallenge,path:string,options:{code?:string;token?:string;body?:{answer:string;requestId:string}}={}) {
  if (config.archived) throw new ChallengeError('closed');
  const response=await fetch(config.endpoint+path,{method:options.body?'POST':'GET',cache:'no-store',credentials:'omit',redirect:'error',
    headers:{...(options.code?{Authorization:`Bearer ${options.code}`} : {}),...(options.token?{'X-Turnstile-Token':options.token}:{}),
      ...(options.body?{'Content-Type':'application/json'}:{})},
    ...(options.body?{body:JSON.stringify(options.body)}:{}),signal:AbortSignal.timeout(15000)});
  if(!response.ok) {
    const body=await response.json().catch(()=>({status:'unavailable'}));
    throw new ChallengeError(body.status,Math.max(0,Number(body.retryAfter)||Number(response.headers.get('Retry-After'))||0));
  }
  return response;
}

export async function readAnswerFile(file:File,limit:number) {
  if(file.size>Math.min(limit,524288)) throw new Error('This file is too large. Check the problem output format.');
  const bytes=await file.arrayBuffer();
  try {return new TextDecoder('utf-8',{fatal:true}).decode(bytes);} catch {throw new Error('Select a UTF-8 text output file.');}
}
