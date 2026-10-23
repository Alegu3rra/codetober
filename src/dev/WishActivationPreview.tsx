import React, { useEffect, useRef, useState } from 'react';
import { wishes } from '../features/wishes/catalog';
import { WishChevron } from '../features/wishes/WishChevron';
import { WishArt } from '../features/wishes/WishArt';
import { Home } from '../pages/Home';
import { Scoreboard } from '../pages/Scoreboard';
import { Editorials } from '../pages/Editorials';
import { Releases } from '../pages/Releases';
import { About } from '../pages/About';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { Timestamp } from '../components/Timestamp';
import { InfoTooltip } from '../components/InfoTooltip';
import type { ParticipantSupplement } from '../components/ParticipantRow';
import type { AdditionalProblemHistory } from '../components/ParticipantDetails';
import type { Day, EventData, Participant } from '../data/schema';
import { previewData } from './preview';
import './wish-design.css';

type Phase = 'scheduled' | 'active' | 'closed';
const tabs = ['Problems', 'Scoreboard', 'Editorials', 'Releases', 'About / Join', 'Make a Wish'] as const;
type Tab = typeof tabs[number];
const missionTitles = ['The Lantern Keeper', 'A Trail of Starlight', 'The Last Spark', 'A Pocket of Moonlight', 'The Wishing Well'];
const hints = ['Start with a tiny example. Which part of the state changes after each step?', 'Separate what you have already processed from what is still waiting.', 'Keep only the information needed for the next step, rather than repeating the whole calculation.'];
const zone = 'America/Mexico_City';
const tabHash = (tab: Tab) => tab === 'Make a Wish' ? '#make-a-wish' : tab === 'About / Join' ? '#community' : `#${tab.toLowerCase()}`;
const tabFromHash = () => tabs.find(tab => tabHash(tab) === window.location.hash) ?? 'Problems';

function fixture(final: boolean, phase: Phase): EventData {
  const data = structuredClone(previewData);
  const last = final ? phase === 'scheduled' ? 30 : 31 : phase === 'closed' ? 31 : 28;
  data.generatedAt = phase === 'closed' ? '2026-11-01T13:00:00Z' : `2026-10-${last}T16:00:00Z`;
  data.lastSuccessfulSyncAt = data.generatedAt;
  data.participantsLastSuccessAt = data.generatedAt;
  for (let i = 4; i <= last; i++) {
    const date = `2026-10-${String(i).padStart(2, '0')}`;
    data.days.push({ id: `design-day-${i}`, date, title: 'Compare Your Approaches', description: 'Explore two approaches and compare their trade-offs.', releaseAt: `${date}T12:00:00Z`,
      problems: [0, 1].map(n => ({ titleSlug: final && i === 31 && n === 1 ? 'preview-community-final' : `preview-day-${i}-problem-${n + 1}`,
        title: final && i === 31 && n === 1 ? 'The Last Lantern' : n === 0 ? 'Preview Path Problem' : 'Preview Sequence Problem',
        difficulty: n === 0 ? 'Easy' : 'Medium', url: `https://leetcode.com/problems/${final && i === 31 && n === 1 ? 'preview-community-final' : `preview-day-${i}-problem-${n + 1}`}/` })),
    });
  }
  data.participants.forEach((person, i) => {
    person.lastSyncedAt = data.generatedAt;
    for (const day of data.days.slice(3)) {
      const solved = i === 0 && ['2026-10-27', '2026-10-28'].includes(day.date);
      person.results.push(...day.problems.map((p, n) => ({ titleSlug: p.titleSlug, firstAcceptedAt: solved ? `${day.date}T${13 + n}:00:00Z` : null })));
      if (solved) { person.problemsCompleted += 2; person.daysCompleted++; person.dayProgress?.push({ date: day.date, onTimeProblems: 2 }); }
    }
  });
  return data;
}

function PracticeDialog({ title, close }: { title: string; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => { ref.current?.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} className="wish-modal" aria-labelledby="practice-title" onCancel={close}>
    <button autoFocus className="wish-modal-close" aria-label="Close practice problem" onClick={close}>×</button>
    <WishArt motif="stars" /><p className="wish-eyebrow">Illustrative problem</p><h2 id="practice-title">{title}</h2>
    <p>Help a lantern keeper find a pattern in a sequence of lights. Explore a small example, choose an approach, and check its complexity.</p>
    <div className="wish-example"><strong>Design preview</strong><p>This is a fictional problem. The final version will open a reviewed LeetCode problem and detect accepted submissions through synchronization.</p></div>
    <button className="wish-cta" onClick={close}>Back to the challenge</button>
  </dialog>;
}

export default function WishActivationPreview() {
  const params = new URLSearchParams(window.location.search);
  const [wishId, setWishId] = useState<string>((wishes.find(w => w.id === params.get('wish')) ?? wishes[0]).id);
  const [phase, setPhase] = useState<Phase>('active');
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [progress, setProgress] = useState(1);
  const [query, setQuery] = useState('');
  const [hintCount, setHintCount] = useState<Record<string, number>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const wish = wishes.find(w => w.id === wishId)!;
  const isBook = wish.id === 'spellbook-unlocked', isLast = wish.id === 'choose-the-last-problem';
  const isDaily = wish.id === 'one-more-spell', hasCredit = !isBook && !isLast;
  const total = wish.id === 'the-final-quest' ? 3 : isDaily ? 5 : 1;
  const progressLimit = isDaily && phase === 'active' ? 2 : total;
  const data = fixture(isLast, phase), now = Date.parse(data.generatedAt);
  const completedFor = (person: Participant) => !hasCredit || phase === 'scheduled' ? 0 : Math.min(total,
    person.participant_id === data.participants[0].participant_id ? Math.min(progressLimit, progress) : person.participant_id === data.participants[1].participant_id ? 1 : 0);
  const historyFor = (person: Participant): AdditionalProblemHistory[] => Array.from({ length: completedFor(person) }, (_, i) => ({
    id: `${wish.id}-${i}`, title: missionTitles[i], acceptedAt: `2026-10-${isDaily ? 27 + i : 28}T${15 + i}:00:00Z`, creditSeconds: 7200,
    onOpen: () => setProblem(missionTitles[i]),
  }));
  const supplementFor = (person: Participant): ParticipantSupplement | undefined => !hasCredit ? undefined : {
    rankingCreditSeconds: completedFor(person) * 7200,
    stats: <div className="wish-stat"><dt>✧ Make a Wish · {completedFor(person)} optional {completedFor(person) === 1 ? 'solve' : 'solves'} <InfoTooltip label="Make a Wish credit">Two hours off ranking time for each qualifying optional problem, awarded once. No additional main points or streaks. Ranking time cannot go below zero.</InfoTooltip></dt><dd className="elapsed-time">{completedFor(person) ? '−' : ''}{completedFor(person) * 2}h 0m 0s</dd></div>,
    history: historyFor(person),
  };
  useEffect(() => { document.title = 'Codetober · Wish activation designs'; }, []);
  useEffect(() => { const onHash = () => setTab(tabFromHash()); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  function navigate(next: Tab, focus = false) {
    setTab(next); window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${tabHash(next)}`);
    if (focus) requestAnimationFrame(() => document.getElementById(`design-tab-${tabs.indexOf(next)}`)?.focus());
  }
  function chooseWish(id: string) {
    setWishId(id); setProgress(1); setHintCount({}); setQuery('');
    const next = new URLSearchParams(window.location.search); next.set('wish', id);
    window.history.replaceState(null, '', `${window.location.pathname}?${next}${window.location.hash}`);
  }
  const mission = (i: number) => {
    const expired = phase === 'closed' || (isDaily && phase === 'active' && i === 0);
    const future = phase === 'scheduled' || (isDaily && phase !== 'closed' && i > 1);
    return <article className="activation-mission" key={i}>
      <div className="activation-mission-meta"><span>{isDaily ? `OCT ${27 + i}` : `MISSION ${i + 1}`}</span><span>{future ? 'Not released' : expired ? 'Window closed' : 'Available'}</span></div>
      <h3>{future ? 'A new spell awaits' : missionTitles[i]}</h3>
      <p>{wish.id === 'second-chance' ? 'Dynamic programming · a fresh exercise to revisit a tricky topic.' : isDaily ? 'An optional extra beyond the two daily problems.' : 'Complete the three missions in any order before the challenge closes.'}</p>
      <span className="wish-reward">{expired ? 'Practice only · earned credits stay' : '−2h per qualifying accepted submission'}</span>
      <button className="activation-link" disabled={future} onClick={() => setProblem(missionTitles[i])}>{future ? 'Reveals at 06:00' : expired ? 'Practice from the archive →' : 'Open practice problem →'}</button>
      {!future && <small>{isDaily ? `Oct ${27 + i}, 06:00 – ${i === 4 ? 'Nov 1' : `Oct ${28 + i}`}, 06:00` : 'Until Nov 1, 06:00'} · Mexico City</small>}
    </article>;
  };
  const hintsFor = (item: Day['problems'][number]) => {
    if (!item.titleSlug.startsWith('preview-day-27-') && !item.titleSlug.startsWith('preview-day-28-')) return null;
    const count = hintCount[item.titleSlug] ?? 0;
    return <div className="activation-hints"><div><span aria-hidden="true">✧</span><strong>Spellbook hints</strong><small>{count} / 3 revealed</small></div>
      <p>One nudge at a time. Reveal only what you need.</p>
      {hints.slice(0, count).map((hint, i) => <div className="activation-hint" key={i}><span>HINT {i + 1}</span><p>{hint}</p></div>)}
      <button disabled={phase === 'scheduled' || count === 3} onClick={() => setHintCount(s => ({ ...s, [item.titleSlug]: count + 1 }))}>{phase === 'scheduled' ? 'Hints unlock on activation' : count === 3 ? 'All hints revealed' : count === 0 ? 'Reveal first hint' : 'Reveal next hint'}</button>
      <span role="status" className="sr-only">{item.title}: {count} hints revealed</span>
    </div>;
  };
  const dailyBonus = <aside className="wish-daily-bonus" aria-label="Optional daily bonus spell">
    <div><span className="wish-eyebrow">✧ One More Spell · Optional bonus</span><h3>{phase === 'scheduled' ? 'A new spell is on its way' : missionTitles[1]}</h3><small>Separate from today’s theme · No main points or streaks</small></div>
    <div className="wish-daily-action"><span className="wish-reward">−2h</span><button className="activation-link" disabled={phase === 'scheduled'} onClick={() => setProblem(missionTitles[1])}>{phase === 'scheduled' ? 'Not released yet' : 'Open bonus problem →'}</button><button className="wish-small-link" onClick={() => navigate('Make a Wish')}>Rules & progress →</button></div>
  </aside>;
  const finalProblem = <article className="activation-final"><div><p className="wish-eyebrow">October 31 · One reviewed problem</p><h3>{phase === 'scheduled' ? 'One last secret' : 'The Last Lantern'}</h3><p>Chosen by <strong>@fictional_golden</strong>. {phase === 'scheduled' ? 'The title and link remain hidden until release.' : 'It takes one of the two regular daily slots, with normal points and timing.'}</p><p className="activation-window">Oct 31, 06:00 – Nov 1, 06:00 · Mexico City</p><button className="activation-link" disabled={phase === 'scheduled'} onClick={() => navigate('Problems')}>{phase === 'scheduled' ? 'Reveals October 31 at 06:00' : 'Find it in the final day’s problems →'}</button>{phase === 'closed' ? <details className="activation-editorial"><summary>Read the winner’s editorial</summary><p>A sample explanation would appear here after the daily window closes, with approach, code, and complexity.</p><small>No additional editorial credit is awarded for this contribution.</small></details> : <p className="muted activation-note">The winner submits their solution during the official window. Their editorial appears after closure, with no additional credit.</p>}</div><WishArt motif={phase === 'scheduled' ? 'book' : 'star'} /></article>;
  const visible = data.participants.filter(p => `${p.display_name} ${p.leetcode_username}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <a className="skip-link" href="#design-main">Skip to content</a>
    <aside className="design-controls" aria-label="Design preview controls"><div><strong>Wish activation · Design preview</strong><span>Fictional content and example progress. No real scores change.</span></div>
      <label>Wish<select aria-label="Wish" value={wish.id} onChange={e => chooseWish(e.target.value)}>{wishes.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label>
      <label>Stage<select aria-label="Stage" value={phase} onChange={e => {setPhase(e.target.value as Phase); setHintCount({});}}><option value="scheduled">Scheduled</option><option value="active">Active</option><option value="closed">Closed</option></select></label>
      {hasCredit && <label>Golden Example’s accepts<select aria-label="Example accepted" value={Math.min(progressLimit, progress)} onChange={e => setProgress(Number(e.target.value))}>{Array.from({length: progressLimit + 1}, (_, i) => <option key={i} value={i}>{i} accepted</option>)}</select></label>}
    </aside>
    <nav aria-label="Community wish announcement"><a className="wish-banner" href="#make-a-wish" onClick={e => {e.preventDefault(); navigate('Make a Wish');}}><span aria-hidden="true">✧</span><strong>{wish.title}</strong><span>Community wish · {phase === 'scheduled' ? 'Coming soon' : phase === 'closed' ? 'Completed' : 'Active'}</span><span className="wish-banner-action">Rules & progress →</span></a></nav>
    <SiteHeader now={now} />
    <div className="shell activation-shell"><nav aria-label="Primary"><div className="tabs activation-tabs" role="tablist" aria-label="Wish design navigation" onKeyDown={e => {
      const at = tabs.indexOf(tab), next = e.key === 'ArrowRight' ? (at + 1) % tabs.length : e.key === 'ArrowLeft' ? (at + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) {e.preventDefault(); navigate(tabs[next], true);}
    }}>{tabs.map((t, i) => <button role="tab" key={t} id={`design-tab-${i}`} aria-controls="design-panel" aria-selected={t === tab} tabIndex={t === tab ? 0 : -1} onClick={() => navigate(t)}>{t}</button>)}</div></nav>
      <main id="design-main"><h1 className="sr-only">Codetober 2026 · Wish design preview</h1><div role="tabpanel" id="design-panel" aria-labelledby={`design-tab-${tabs.indexOf(tab)}`} tabIndex={0}>
      {tab === 'Problems' ? <Home data={data} now={now} zone={zone} afterDailyProblems={isDaily ? dailyBonus : undefined} renderProblemExtra={isBook ? hintsFor : isLast ? item => item.titleSlug === 'preview-community-final' ? <p className="wish-final-tag">✧ Community choice · @fictional_golden</p> : null : undefined} />
      : tab === 'Scoreboard' ? <Scoreboard data={data} now={now} zone={zone} participantSupplement={supplementFor} />
      : tab === 'Editorials' ? <Editorials data={data} loading={false} error={false} hash="" />
      : tab === 'Releases' ? <Releases /> : tab === 'About / Join' ? <About now={now} />
      : <section className="wish-page">
        <div className="activation-hero"><div><p className="wish-eyebrow">Wish granted · For the whole community</p><h2>{wish.title}</h2><p>{wish.description}</p><div className="activation-winner"><span aria-hidden="true">✧</span><span>Chosen by <strong>Golden Example</strong><small>@fictional_golden · Sunday challenge winner</small></span></div><p className="activation-window">{phase === 'scheduled' ? 'Approved · awaiting activation' : phase === 'closed' ? 'Completed · earned credits stay' : 'Active · ends Nov 1 at 06:00'} · Mexico City</p>{(isDaily || isBook || isLast) && <button className="activation-link" onClick={() => navigate('Problems')}>{isBook ? 'Find hints under the daily problems →' : isLast ? 'Visit the regular daily problems →' : 'Find today’s bonus under the daily problems →'}</button>}</div><WishArt motif={wish.motif} /></div>
        <div className="wish-section-heading"><div><p className="wish-eyebrow">What this wish unlocked</p><h2>{isBook ? 'A nudge under each new problem' : isLast ? 'A community signature on the final day' : isDaily ? 'Daily spells' : wish.id === 'the-final-quest' ? 'Three optional missions' : 'A fresh chance at a tricky topic'}</h2></div></div>
        {isLast ? finalProblem : isBook ? <p className="notice">Open Problems to reveal progressive hints underneath each new daily problem. No extra points or time credit; use only the help you need.</p>
        : isDaily ? <div className="wish-daily-archive">{Array.from({length: total}, (_, i) => <details className="archive-day" key={i}><summary><WishChevron /><span className="day-label">OCT {27 + i}</span><span className="wish-day-title">{phase === 'scheduled' || (phase !== 'closed' && i > 1) ? 'A new spell awaits' : missionTitles[i]}</span><span className="wish-reward">Optional · −2h</span></summary>{mission(i)}</details>)}</div>
        : <div className="activation-missions">{Array.from({length: total}, (_, i) => mission(i))}</div>}
        {hasCredit && <section className="wish-progress-list" aria-label="Community wish progress"><div className="wish-section-heading"><h2>Community progress</h2><span className="muted">Updated with each synchronization</span></div><label className="sr-only" htmlFor="wish-person-search">Find a wish participant</label><input id="wish-person-search" type="search" placeholder="Name or LeetCode username" value={query} onChange={e => setQuery(e.target.value)} /><p className="muted">{visible.length} participants · Optional practice only</p>
          {visible.map(person => <details className="participant compact-participant wish-progress-entry" key={person.participant_id}><summary className="wish-progress-summary"><span className="wish-progress-mark" aria-hidden="true">✧</span><span className="wish-progress-name"><strong>{person.display_name}</strong><small>@{person.leetcode_username}</small></span><span className="wish-progress-metrics"><span className="wish-progress-count"><small>Spells accepted</small><strong>{completedFor(person)} / {total}</strong></span><span className="wish-progress-count"><small>Time credit</small><strong>{completedFor(person) ? `−${completedFor(person) * 2}h` : '0h'}</strong></span></span><span className="wish-progress-chevron"><WishChevron /></span></summary><div className="wish-progress-detail"><progress max={total} value={completedFor(person)} aria-label={`${person.display_name}: ${completedFor(person)} of ${total} optional problems`} /><div className="result-list">{Array.from({length: total}, (_, i) => {const accepted = historyFor(person)[i]; return <div className="result" key={i}><span>{phase === 'scheduled' || (isDaily && phase !== 'closed' && i > 1) ? 'Not released yet' : missionTitles[i]}</span><span>{accepted ? <>✓ Accepted · <Timestamp value={accepted.acceptedAt} zone={zone} /></> : '— No accepted submission recorded'}</span><span className="result-time">{accepted ? '−2h' : '—'}</span></div>;})}</div><small>Credits appear in the participant’s Scoreboard details. Main points and streaks stay separate.</small></div></details>)}
          {!visible.length && <p className="empty">No participants match your search.</p>}
        </section>}
        <details className="wish-rules activation-rules"><summary>Rules for this granted wish</summary><p>{wish.detail}</p><p>{hasCredit ? 'Two hours off once for each qualifying optional problem. No main points or streaks; skipping has no penalty. Minimum ranking time: zero. Previously earned benefits stay after closure.' : 'Regular daily points and time rules continue to apply. This wish grants no separate time credit.'}</p></details>
      </section>}
      </div></main><SiteFooter data={data} zone={zone} />
    </div>{problem && <PracticeDialog title={problem} close={() => setProblem(null)} />}
  </>;
}
