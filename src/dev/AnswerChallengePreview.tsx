import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { z } from 'zod';
import { EventPage } from '../pages/EventPage';
import { Timestamp } from '../components/Timestamp';
import './answer-challenge.css';

const API = 'http://127.0.0.1:8787';
const metadataSchema = z.object({ demo: z.literal(true), id: z.string().regex(/^[a-z0-9-]+$/), version: z.number(),
  status: z.enum(['scheduled', 'open', 'closed']), title: z.string().optional(), statement: z.string().optional(),
  opensAt: z.string().datetime({ offset: true }), closesAt: z.string().datetime({ offset: true }), serverNow: z.string(),
});
type Metadata = z.infer<typeof metadataSchema>;
const messages: Record<string, string> = {
  'invalid-access': 'That access code is invalid or has been replaced. Check your private email draft.',
  'not-open': 'This challenge has not opened yet.', closed: 'The submission window has closed.',
  cooldown: 'Please wait before trying another answer.', 'rate-limit': 'Too many requests. Please wait a minute.',
  'attempt-limit': 'The attempt limit has been reached. Contact the organizer.',
  'invalid-request': 'Enter a single integer, with no extra text.',
  'request-conflict': 'This attempt conflicts with an earlier request. Edit your answer and try again.',
};

function AnswerDialog({ close }: { close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [credential, setCredential] = useState('');
  const [name, setName] = useState('');
  const [answer, setAnswer] = useState('');
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const attempt = useRef<{ answer: string; id: string } | null>(null);
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); trigger?.focus(); };
  }, []);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function refresh() {
    try {
      const response = await fetch(`${API}/api/challenge`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error();
      const data = metadataSchema.parse(await response.json());
      setMetadata(data); setError('');
    } catch { setError('The local demo API is unavailable. Start the challenge server, then retry.'); }
  }
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 30000); return () => clearInterval(timer); }, []);
  async function authenticate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const code = codeInput.trim();
      const response = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${code}` }, cache: 'no-store', signal: AbortSignal.timeout(5000) });
      const body = await response.json();
      if (!response.ok) { setError(messages[body.status] ?? 'Could not verify access. Please retry.'); return; }
      const me = z.object({ name: z.string(), acceptedAt: z.string().datetime().nullable() }).parse(body);
      setCredential(code); setCodeInput(''); setName(me.name); setAcceptedAt(me.acceptedAt);
    } catch { setError('Could not reach the local demo API. Your code has not been stored.'); }
    finally { setBusy(false); }
  }
  async function download() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/api/input`, { headers: { Authorization: `Bearer ${credential}` }, cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!response.ok) { const body = await response.json(); setError(messages[body.status] ?? 'Input could not be downloaded.'); return; }
      const blob = await response.blob(), url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${metadata?.id ?? 'challenge'}-input.txt`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Your input is ready. Downloading it again gives you the same file.');
    } catch { setError('Download failed. Please retry; your assigned input will stay the same.'); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    if (!attempt.current || attempt.current.answer !== answer) attempt.current = { answer, id: crypto.randomUUID() };
    try {
      const response = await fetch(`${API}/api/answer`, { method: 'POST', headers: { Authorization: `Bearer ${credential}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, requestId: attempt.current.id }), signal: AbortSignal.timeout(10000) });
      const body = await response.json();
      if (body.retryAfter) setRetryAt(Date.now() + body.retryAfter * 1000);
      if (!response.ok) { setError(messages[body.status] ?? 'Submission could not be confirmed. Retry the same answer to check it safely.'); return; }
      if (body.status === 'correct' || body.status === 'already-accepted') {
        setAcceptedAt(z.string().datetime().parse(body.acceptedAt)); setAnswer('');
      } else { setError('That answer is incorrect. Check your input and try again.'); attempt.current = null; }
    } catch { setError('No confirmation received. Retry the same answer; the attempt will not be counted twice.'); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="answer-dialog" aria-labelledby="answer-title" onCancel={close}>
    <button className="answer-close" onClick={close} aria-label="Close answer challenge">×</button>
    <p className="answer-eyebrow">Choose the Last Problem · Working demo</p>
    <h2 id="answer-title">{metadata?.title ?? 'A sealed challenge'}</h2>
    <p className="answer-demo-note">Fictional problem and participants · Simulated final-day window · Real local validation · No changes to the event score</p>
    {!metadata && <button onClick={() => void refresh()}>Retry connection</button>}
    {metadata && <div className="answer-window"><span><Timestamp value={metadata.opensAt} zone="America/Mexico_City" /> → <Timestamp value={metadata.closesAt} zone="America/Mexico_City" /></span><strong>{metadata.status === 'open' ? 'Window open · Demo' : metadata.status === 'scheduled' ? 'Not released' : 'Window closed'}</strong></div>}
    {metadata?.statement && <div className="answer-statement"><Markdown skipHtml>{metadata.statement.replace(/^# [^\n]+\n+/, '')}</Markdown></div>}
    {metadata?.status === 'scheduled' && <p className="notice">The statement and personal inputs remain hidden until opening.</p>}
    {metadata && <section className="answer-workspace" aria-label="Your challenge workspace">
      {!credential ? <form onSubmit={authenticate}><p className="answer-eyebrow">01 · Your private access</p><h3>Start with your email code</h3><p>For this demo, copy the code from your private <code>demo-001.eml</code> or <code>demo-002.eml</code> draft. No email is sent.</p><label htmlFor="answer-code">Private access code</label><div className="answer-input-row"><input id="answer-code" type="password" required autoComplete="off" spellCheck={false} value={codeInput} onChange={e => setCodeInput(e.target.value)} /><button disabled={busy || !codeInput.trim()}>{busy ? 'Checking…' : 'Verify access →'}</button></div><small>Your code stays in memory. Re-enter it after closing or reloading.</small></form>
        : <><div className="answer-identity"><div><span className="answer-eyebrow">Access verified</span><h3>{name}</h3></div><button disabled={busy} onClick={() => { setCredential(''); setCodeInput(''); setName(''); setAnswer(''); setAcceptedAt(null); setError(''); setNotice(''); attempt.current = null; }}>Clear access</button></div>
          <div className="answer-download"><div><p className="answer-eyebrow">02 · Your input</p><p>One input, assigned to you. Solve on your computer in any language.</p></div><button disabled={busy || metadata.status !== 'open'} onClick={() => void download()}>Download input ↓</button></div>
          {acceptedAt ? <div className="answer-success" role="status"><strong>✓ Correct answer accepted</strong><p>First accepted: <Timestamp value={acceptedAt} zone="America/Mexico_City" seconds />.</p><p>Saved in the private demo bundle. The live scoreboard has not changed.</p></div>
            : <form onSubmit={submit}><p className="answer-eyebrow">03 · Your final answer</p><label htmlFor="final-answer">Answer (one integer)</label><div className="answer-input-row"><input id="final-answer" type="text" inputMode="text" autoComplete="off" maxLength={128} required value={answer} onChange={e => setAnswer(e.target.value)} /><button disabled={busy || !answer.trim() || remaining > 0 || metadata.status !== 'open'}>{busy ? 'Checking…' : remaining > 0 ? `Try again in ${remaining}s` : 'Submit answer →'}</button></div><small>Only your first correct answer counts. Do not submit your source code.</small></form>}
        </>}
    </section>}
    {error && <p className="answer-error" role="alert">{error}</p>}
    {notice && <p className="answer-notice" role="status">{notice}</p>}
  </dialog>;
}

export default function AnswerChallengePreview() {
  const [open, setOpen] = useState(window.location.hash === '#answer-challenge');
  return <>
    <div className="announcement-preview"><span>LOCAL CHALLENGE DEMO</span> Fictional final day · Codes and inputs from the private local API · No live score changes</div>
    <EventPage renderProblemAction={problem => problem.titleSlug === 'demo-potion-ledger'
      ? <button className="answer-open" onClick={() => setOpen(true)}>Open answer challenge →</button>
      : <span className="muted">Illustrative problem · Preview only</span>} />
    {open && <AnswerDialog close={() => setOpen(false)} />}
  </>;
}
