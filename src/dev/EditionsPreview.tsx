import React, { useEffect, useState } from 'react';
import { Home } from '../pages/Home';
import { Scoreboard } from '../pages/Scoreboard';
import { SiteFooter } from '../components/SiteFooter';
import { previewData } from './preview';
import { closedPreviewData } from './closed-preview';
import type { EventData } from '../data';
import './editions-preview.css';

type Scenario = 'upcoming' | 'active' | 'closed';
const simulatedTimes = { upcoming: '2026-11-02T12:00:00Z', active: '2027-10-03T18:00:00Z', closed: '2027-11-02T12:00:00Z' };
function nextEdition(source: EventData): EventData {
  const data = JSON.parse(JSON.stringify(source).replaceAll('2026-', '2027-')) as EventData;
  data.participants = data.participants.map(p => ({ ...p, participant_id: `2027-${p.participant_id}`, display_name: `2027 Demo · ${p.display_name}` }));
  return data;
}
const active2027 = nextEdition(previewData);
const closed2027 = nextEdition(closedPreviewData);
const upcoming2027: EventData = {
  ...active2027, generatedAt: simulatedTimes.upcoming, participants: [], days: [],
  participantsLastSuccessAt: null, lastSuccessfulSyncAt: null,
};

export default function EditionsPreview() {
  const initial = new URLSearchParams(window.location.search);
  const [year, setYear] = useState(initial.get('edition') === '2026' ? '2026' : '2027');
  const [scenario, setScenario] = useState<Scenario>('upcoming');
  const [tab, setTab] = useState('Problems');
  const [ticks, setTicks] = useState(0);
  useEffect(() => { const timer = setInterval(() => setTicks(t => t + 1000), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { document.title = `Codetober ${year} · Local preview`; }, [year]);
  const now = Date.parse(simulatedTimes[scenario]) + ticks;
  const data = year === '2026' ? closedPreviewData : scenario === 'upcoming' ? upcoming2027 : scenario === 'active' ? active2027 : closed2027;
  const hasActiveEdition = scenario === 'active';
  function editionUrl(value: string) { return `${window.location.pathname}?preview=editions&edition=${value}`; }
  function chooseYear(value: string) {
    setYear(value); setTab('Problems');
    window.history.replaceState(null, '', editionUrl(value));
  }
  const editionLink = (value: string, label: string) => <a href={editionUrl(value)} onClick={e => { e.preventDefault(); chooseYear(value); }}>{label}</a>;
  return <div className="shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header>
      <div className="edition-heading" key={year}>
        <span aria-hidden="true">[</span>
        <span className="edition-typing">
          <a href={editionUrl(year)} onClick={e => {e.preventDefault(); setTab('Problems');}} aria-label={`Codetober ${year} home`}>Codetober</a>{' '}
          <select className="edition-select" aria-label="Choose edition" value={year} onChange={e => chooseYear(e.target.value)}>
            <option value="2027">2027</option><option value="2026">2026</option>
          </select>
        </span>
        <span aria-hidden="true">]</span>
      </div>
      <a className="header-note" href="https://alegu3rra.github.io/">By: Alejandra Guerra</a>
    </header>
    <div className="notice edition-demo-controls">
      <strong>Local edition preview</strong>
      <p>Fictional data and simulated dates. The 2027 edition and its dates are examples, not an announcement.</p>
      <label>Simulate: <select value={scenario} onChange={e => {setScenario(e.target.value as Scenario); setTicks(0);}}>
        <option value="upcoming">Between editions</option><option value="active">Contest active</option><option value="closed">Contest closed</option>
      </select></label>
    </div>
    {year === '2026' && <p className="notice">Viewing the 2026 archive. {editionLink('2027', 'Go to latest edition →')}</p>}
    <nav aria-label="Preview navigation" className="tabs">{['Problems','Scoreboard','About / Join'].map(name => <button key={name} aria-current={tab === name ? 'page' : undefined} onClick={() => setTab(name)}>{name}</button>)}</nav>
    <main id="main" tabIndex={-1}>
      <h1 className="sr-only">Codetober {year}</h1>
      {tab === 'Problems' && <Home data={data} now={now} zone={data.event.timezone}
        editionNavigation={year === '2027' && !hasActiveEdition ? editionLink('2026', 'View previous edition →') : undefined} />}
      {tab === 'Scoreboard' && <Scoreboard data={data} now={now} zone={data.event.timezone} />}
      {tab === 'About / Join' && <section className="about">
        <h2>Join Codetober {year}</h2>
        <p>A community programming challenge. Two problems a day throughout October.</p>
        {year === '2026' || scenario === 'closed' ? <p className="empty">Registration is closed for {year}.</p>
          : scenario === 'upcoming' ? <p className="empty">Registration for 2027 is not open yet.</p>
          : <p className="notice">The registration link for 2027 would appear here. No real form is connected to this preview.</p>}
        <p className="muted">Each edition has its own registration, participant list, scores and streaks.</p>
        {year === '2026' && editionLink('2027', 'Go to latest edition →')}
      </section>}
    </main>
    <SiteFooter data={data} zone={data.event.timezone} />
  </div>;
}
