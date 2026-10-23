import React, { useEffect, useRef, useState } from 'react';
import type { EventData } from '../data/schema';
import type { WishEvent } from '../features/wishes/schema';
import { wishes, type Wish } from '../features/wishes/catalog';
import { WishContact } from '../features/wishes/WishContact';
import { WishArt } from '../features/wishes/WishArt';
import { FairyDust } from '../features/wishes/FairyDust';
import { Timestamp } from '../components/Timestamp';
import { Countdown } from '../components/Countdown';

function WishModal({ wish, email, close }: { wish: Wish; email: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const el = dialog.current;
    if (el?.showModal) el.showModal(); else el?.setAttribute('open', '');
    return () => { el?.close?.(); trigger?.focus(); };
  }, []);
  return <dialog ref={dialog} className="wish-modal" aria-labelledby="wish-modal-title" onCancel={close}
    onClick={e => { if (e.target === e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    } }}>
    <button className="wish-modal-close" onClick={close} autoFocus aria-label="Close wish details">×</button>
    <WishArt motif={wish.motif} />
    <p className="wish-eyebrow">Community wish · {wish.number}</p>
    <h2 id="wish-modal-title">{wish.title}</h2>
    <p className="wish-reward">{wish.reward}</p>
    <p>{wish.description}</p>
    <div className="wish-example"><strong>Imagine this</strong><p>{wish.example}</p></div>
    <p className="muted">{wish.detail}</p>
    <p className="muted">A proposal for the organizer to review. Benefits begin only after approval and announcement, with no retroactive effects. Ranking time cannot go below zero.</p>
    <WishContact email={email} title={wish.title} />
  </dialog>;
}

const resultLabels: Record<WishEvent['result']['status'], string> = {
  announced: 'The magic begins on Sunday', open: 'Waiting for the first complete pair', review: 'Result under review',
  'no-winner': 'Window closed · no qualifying pair recorded', confirmed: 'Winner confirmed', 'wish-review': 'Wish under review',
  approved: 'Community wish approved', applied: 'Community wish activated', expired: 'Wish selection period ended',
};

export function MakeAWish({ data, event, now, zone }: { data: EventData; event: WishEvent; now: number; zone: string }) {
  const [chosen, setChosen] = useState<Wish | null>(null);
  const [effects, setEffects] = useState(true);
  const section = useRef<HTMLElement>(null);
  const before = now < Date.parse(event.startAt), active = !before && now < Date.parse(event.endAt);
  const day = data.days.find(d => d.date === event.date);
  const winner = data.participants.find(p => p.participant_id === event.result.winnerId);
  const approvedWish = wishes.find(w => w.id === event.result.wishId);
  return <section id="make-a-wish" ref={section} className={`wish-page${active && effects ? ' wish-wand' : ''}`}>
    <FairyDust enabled={active && effects} target={section} />
    <div className="wish-hero">
      <div className="wish-hero-copy">
        <p className="wish-eyebrow">October 25 · A Sunday with a little magic</p>
        <h2>Make a <span>Wish</span><span className="wish-heading-star" aria-hidden="true">✧</span></h2>
        <p className="wish-lead">Two problems. One spark.<br />A wish for the whole community.</p>
        <p>Pair your spells and potions. Find the magical number. Be the first to complete both Sunday problems and earn the chance to shape the end of Codetober.</p>
        <div className="wish-timing"><span>{before ? 'The spell opens in' : active ? 'The spell closes in' : 'The solving window has closed'}</span>
          {(before || active) && <Countdown target={before ? event.startAt : event.endAt} now={now} />}</div>
        <p className="muted wish-date"><Timestamp value={event.startAt} zone={zone} /> – <Timestamp value={event.endAt} zone={zone} /> · end excluded</p>
      </div>
      <div className="wish-hero-art"><WishArt motif="stars" /><span>Practice makes magic.</span></div>
    </div>

    <div className="wish-result" aria-label="Make a Wish result">
      <span aria-hidden="true">✧</span><div><h3>{event.result.status === 'open' && event.result.candidates.length > 0 ? 'Complete pair detected · provisional result' : resultLabels[event.result.status]}</h3>
        {winner && <p><strong>{winner.display_name}</strong> · @{winner.leetcode_username}</p>}
        {event.result.status === 'open' && event.result.candidates.length > 0 && <p>A complete pair has been detected. All results remain provisional until organizer review.</p>}
        {event.result.status === 'review' && <p>{event.result.candidates.length > 1 ? 'An exact tie was recorded. The organizer will contact the tied participants by email, review their choices, and determine one community wish.' : 'The organizer will verify accepted submissions and registration before confirming the winner.'}</p>}
        {event.result.status === 'no-winner' && <p>No winner can be declared without two qualifying accepts. Missing submissions may still be reviewed by the organizer.</p>}
        {event.result.status === 'confirmed' && event.result.confirmedAt && <p>Email your choice within 24 hours of confirmation: <Timestamp value={event.result.confirmedAt} zone={zone} />.</p>}
        {event.result.status === 'expired' && <p>The wish does not automatically pass to the next participant.</p>}
        {event.result.status === 'wish-review' && <p>The choice has been received and is awaiting organizer approval.</p>}
        {approvedWish && <p className="wish-reward">{approvedWish.title}</p>}
        {event.result.wishText && <p>{event.result.wishText}</p>}
        {event.result.status === 'approved' && <p>Approved; benefits begin when the organizer announces activation.</p>}
      </div>
    </div>

    <div className="wish-section-heading"><div><p className="wish-eyebrow">The Sunday challenge</p><h3>Complete the pair</h3></div>
      {active && <button className="wish-effects-toggle" aria-pressed={effects} onClick={() => setEffects(v => !v)}>Fairy dust: {effects ? 'on' : 'off'}</button>}</div>
    {day ? <div className="wish-problems">{day.problems.map((problem, i) => <a key={problem.titleSlug} href={problem.url} target="_blank" rel="noreferrer">
      <span className="wish-eyebrow">Spell {i + 1} · {problem.difficulty}</span><strong>{problem.title} ↗</strong><span>Accepted after Sunday’s release, before Monday’s deadline.</span>
    </a>)}</div> : <p className="notice">Both problems will be revealed at Sunday’s 06:00 release. Their titles and links stay hidden until then.</p>}

    <div className="wish-section-heading"><div><p className="wish-eyebrow">Five possibilities. One shared reward.</p><h3>What will you wish for?</h3></div><span className="muted">Open a card to explore</span></div>
    <div className="wish-grid">{wishes.map(wish => <button key={wish.id} className="wish-card" onClick={() => setChosen(wish)} aria-haspopup="dialog">
      <div className="wish-card-top"><span>{wish.number}</span><span aria-hidden="true">↗</span></div>
      <WishArt motif={wish.motif} /><h4>{wish.title}</h4><p>{wish.tagline}</p><span className="wish-reward">{wish.reward}</span>
      <span className="wish-card-explore">Explore this wish →</span>
    </button>)}</div>

    <div className="wish-custom"><span aria-hidden="true">✉</span><div><h3>A wish of your own?</h3><p>Propose a change that brings more practice, learning, or participation to Codetober. The organizer reviews every choice before it takes effect.</p>
      <WishContact email={event.contactEmail} /><p className="muted">Your registration email stays private.</p></div></div>

    <details className="wish-rules"><summary>How the wish is earned</summary><ol>
      <li>Complete both Sunday problems during the official window. Earlier solves do not count; a new accepted submission within the window is required.</li>
      <li>The earliest second acceptance wins. If tied, compare the first acceptance. An exact tie is resolved by email: the organizer reviews the tied participants’ choices and determines one wish. There is no third problem.</li>
      <li>Results use submission timestamps, not synchronization order. LeetCode’s recent history is limited; detected leaders are provisional until reviewed. Missing accepts can be corrected.</li>
      <li>The confirmed winner has 24 hours to email a choice from their registration address. If no choice arrives, the wish expires without automatically passing to someone else.</li>
      <li>The five wishes are proposals. Only the approved wish is activated after an announcement. Extra problems are optional, earn 2 hours off once per problem, and change neither main points nor streaks. Skipping them has no penalty. Ranking time has a floor of zero.</li>
      <li>Choose the Last Problem accepts one reviewed problem, kept secret until release. The winner submits their editorial before release and their LeetCode solution during the official daily window. That editorial earns no additional credit and appears after the window closes.</li>
    </ol></details>
    {chosen && <WishModal wish={chosen} email={event.contactEmail} close={() => setChosen(null)} />}
  </section>;
}
