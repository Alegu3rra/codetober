import React,{useEffect,useRef,useState} from 'react';
import Markdown from 'react-markdown';
import type {AnswerChallenge} from '../../data/schema';
import {Timestamp} from '../../components/Timestamp';
import {Turnstile} from './Turnstile';
import {accessSchema,catalogSchema,ChallengeError,readAnswerFile,requestChallenge,resultSchema} from './api';
import './answer-challenge.css';

export function AnswerChallengeDialog({config,titleSlug,statement,close}:{config:AnswerChallenge;titleSlug:string;statement?:string;close:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null),disposed=useRef(false),inFlight=useRef(false);
  const [catalog,setCatalog]=useState<ReturnType<typeof catalogSchema.parse>|null>(null);
  const [codeInput,setCodeInput]=useState(''),[credential,setCredential]=useState(''),[name,setName]=useState('');
  const [answer,setAnswer]=useState<string|null>(null),[filename,setFilename]=useState(''),[acceptedAt,setAcceptedAt]=useState<string|null>(null);
  const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[retryAt,setRetryAt]=useState(0);
  const [now,setNow]=useState(Date.now()),[token,setToken]=useState(''),[verification,setVerification]=useState(0);
  const attempt=useRef<{answer:string;requestId:string}|null>(null);
  const mapping=config.problems.find(p=>p.titleSlug===titleSlug)!;
  const problem=catalog?.problems.find(p=>p.id===mapping.problemId&&p.version===mapping.problemVersion);
  const siteKey=import.meta.env.VITE_VALIDATOR_TURNSTILE_SITE_KEY as string|undefined;
  const verified=config.demo||!!token;
  const open=catalog?.status==='open'&&!config.archived;
  const remaining=Math.max(0,Math.ceil((retryAt-now)/1000));
  useEffect(()=>{
    disposed.current=false;const trigger=document.activeElement as HTMLElement|null;dialog.current?.showModal();
    const timer=setInterval(()=>setNow(Date.now()),1000);
    return()=>{disposed.current=true;clearInterval(timer);dialog.current?.close();trigger?.focus();};
  },[]);
  async function task(action:()=>Promise<void>,consumeToken=false) {
    if(inFlight.current||disposed.current)return;
    inFlight.current=true;setBusy(true);setError('');setNotice('');
    try {await action();} catch(cause) {
      if(!disposed.current){setError(cause instanceof Error?cause.message:'Request failed. Please retry.');if(cause instanceof ChallengeError&&cause.retryAfter)setRetryAt(Date.now()+cause.retryAfter*1000);}
    } finally {
      inFlight.current=false;
      if(!disposed.current){setBusy(false);if(consumeToken){setToken('');setVerification(n=>n+1);}}
    }
  }
  const options=()=>({code:credential,...(!config.demo?{token}:{})});
  async function loadCatalog() {
    await task(async()=>{
      const data=catalogSchema.parse(await (await requestChallenge(config,'/catalog')).json());
      if(data.eventId!==config.eventId||data.demo!==config.demo||Date.parse(data.opensAt)!==Date.parse(config.opensAt)
        ||Date.parse(data.closesAt)!==Date.parse(config.closesAt))throw new Error('Challenge configuration does not match. Contact the organizer.');
      if(!disposed.current)setCatalog(data);
    });
  }
  useEffect(()=>{if(!config.archived)void loadCatalog();},[]);
  async function authenticate(event:React.FormEvent) {
    event.preventDefault();if(!verified)return;
    await task(async()=>{
      const code=codeInput.trim();
      if(!/^[A-Za-z0-9_-]{43}$/.test(code))throw new Error('Enter the private code from your email.');
      const data=accessSchema.parse(await (await requestChallenge(config,'/access',{code,...(!config.demo?{token}:{})})).json());
      if(data.demo!==config.demo)throw new Error('Challenge configuration does not match.');
      if(disposed.current)return;
      setCredential(code);setCodeInput('');setName(data.name);setAcceptedAt(data.acceptances.find(a=>a.problemId===mapping.problemId)?.acceptedAt??null);
    },true);
  }
  async function download() {
    await task(async()=>{
      const response=await requestChallenge(config,`/problems/${mapping.problemId}/input`,options());
      const blob=await response.blob();if(blob.size>2097152)throw new Error('Input exceeded the allowed size. Contact the organizer.');
      if(disposed.current)return;
      const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${mapping.problemId}-input.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      setNotice('Input downloaded. Keep this file; it is assigned to you.');
    });
  }
  async function submit(event:React.FormEvent) {
    event.preventDefault();if(answer===null||!verified)return;
    if(!attempt.current||attempt.current.answer!==answer)attempt.current={answer,requestId:crypto.randomUUID()};
    const body=attempt.current;
    await task(async()=>{
      const data=resultSchema.parse(await (await requestChallenge(config,`/problems/${mapping.problemId}/answer`,{...options(),body})).json());
      if(data.demo!==config.demo)throw new Error('Challenge configuration does not match.');
      if(disposed.current)return;
      if(data.retryAfter)setRetryAt(Date.now()+data.retryAfter*1000);
      if(data.status==='incorrect'){attempt.current=null;setError('The answer is incorrect. Check your assigned input and output format.');}
      else if(data.acceptedAt){setAcceptedAt(data.acceptedAt);setAnswer(null);attempt.current=null;if(data.favoriteRecorded===false)setNotice('Your answer is accepted. Your favorite could not be saved; contact the organizer if you would like to share it.');}
      else throw new Error('No acceptance confirmation received. Retry the same file.');
    },true);
  }
  return <dialog ref={dialog} className="answer-dialog" aria-labelledby="final-answer-title" onCancel={close}>
    <div className="answer-dialog-toolbar">
      <p className="answer-eyebrow">Choose the Last Problem{config.demo?' · Local demo':''}</p>
      <button type="button" className="answer-close" onClick={close} aria-label="Close answer challenge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <div className="answer-dialog-body">
    <h2 id="final-answer-title">{problem?.title??'Final challenge'}</h2>
    <div className="answer-window"><span><Timestamp value={config.opensAt} zone="America/Mexico_City"/> → <Timestamp value={config.closesAt} zone="America/Mexico_City"/></span></div>
    {config.demo&&<p className="answer-demo-note">Fictional problem and participants. No live event results are changed.</p>}
    {config.archived?<>
      {statement&&<div className="answer-statement"><Markdown skipHtml components={{img:()=>null,a:({children})=><span>{children}</span>}}>{statement}</Markdown></div>}
      <p className="notice">Submissions are closed. Results are preserved in the event scoreboard.</p>
    </>:<>
      {!catalog&&<button onClick={()=>void loadCatalog()} disabled={busy}>Retry connection</button>}
      {problem&&<div className="answer-statement"><Markdown skipHtml components={{img:()=>null,a:({children})=><span>{children}</span>}}>{problem.statement}</Markdown></div>}
      {catalog&&!open&&<p className="notice">{catalog.status==='scheduled'?'The challenge has not opened.':'Submissions are closed.'}</p>}
      {open&&problem&&<section className="answer-workspace" aria-label="Your challenge workspace">
        {!credential?<form onSubmit={authenticate}>
          <h3>Use your private email code</h3><label htmlFor="final-answer-code">Private access code</label>
          <div className="answer-input-row"><input id="final-answer-code" type="password" autoComplete="off" spellCheck={false} value={codeInput} onChange={e=>setCodeInput(e.target.value)} required disabled={busy}/>
          <button disabled={busy||!verified}>Continue</button></div>
          <small>Your code stays in this dialog and is cleared when you close it.</small>
        </form>:<>
          <div className="answer-identity"><strong>{name}</strong><button disabled={busy} onClick={()=>{setCredential('');setName('');setAnswer(null);setFilename('');setAcceptedAt(null);attempt.current=null;setError('');setNotice('');setToken('');setVerification(n=>n+1);}}>Use another code</button></div>
          {acceptedAt?<div className="answer-success" role="status"><strong>Accepted</strong><p><Timestamp value={acceptedAt} zone="America/Mexico_City"/></p><small>The scoreboard updates after synchronization. Your first acceptance is preserved.</small></div>:<>
            <div className="answer-download"><p>Download your input and solve it on your computer.</p><button disabled={busy} onClick={()=>void download()}>Download my input</button></div>
            <form onSubmit={submit}><label htmlFor="final-answer-file">Output file (UTF-8 text, up to {Math.round(problem.maxFileBytes/1024)} KiB)</label>
              <div className="answer-file-picker" data-disabled={busy}>
                <input id="final-answer-file" className="answer-file-input" type="file" accept=".out,.txt,text/plain" disabled={busy} aria-describedby="final-answer-file-hint" onChange={e=>{
                  const file=e.target.files?.[0];setAnswer(null);setFilename('');attempt.current=null;
                  if(file)void task(async()=>{const text=await readAnswerFile(file,problem.maxFileBytes);if(!disposed.current){setAnswer(text);setFilename(file.name);}});
                }}/>
                <svg className="answer-file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M12 18v-6m-3 3 3-3 3 3"/></svg>
                <div className="answer-file-copy"><span className="answer-file-name" title={filename||undefined}>{filename||'Choose your output file'}</span>
                  <span id="final-answer-file-hint" className="answer-file-hint">{filename?'Ready to submit · choose again to replace':'.out or .txt · UTF-8 text'}</span></div>
                <span className="answer-file-button" aria-hidden="true">{filename?'Change file':'Choose file'}</span>
              </div>
              <button disabled={busy||answer===null||!verified||remaining>0}>{busy?'Working…':remaining?`Wait ${remaining}s`:'Submit answer'}</button>
              <small>If confirmation is interrupted, retry the same file without selecting it again.</small>
            </form>
          </>}
        </>}
        {!config.demo&&!acceptedAt&&(siteKey?<Turnstile key={verification} siteKey={siteKey} onToken={setToken}/>:<p role="alert">Verification is unavailable. Contact the organizer.</p>)}
      </section>}
    </>}
    {error&&<p className="answer-error" role="alert">{error}</p>}
    {notice&&<p className="answer-notice" role="status">{notice}</p>}
    </div>
  </dialog>;
}
