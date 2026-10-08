import React from 'react';
import { selectedEdition } from '../editions';
import { releaseViewId, useContentIndicators } from '../hooks/useViewedContent';

export const releaseNotes = [{ id: '2026-release-1', year: 2026, title: 'Release 1 · Earlier solves, better ranks', date: 'October 8, 2026' }];

export function Releases() {
  const { isUnseen, markViewed } = useContentIndicators();
  const entries = releaseNotes.filter(release => release.year === selectedEdition.year);
  return <section>
    <h2>Releases</h2>
    <p className="muted">Updates to the challenge and its dashboard.</p>
    {!entries.length && <p className="empty">No releases published yet.</p>}
    {entries.map(release => <details key={release.id}
      className={`editorial-entry release-note ${isUnseen(releaseViewId(release.id)) ? 'has-unseen-content' : ''}`}
      onToggle={event => { if (event.currentTarget.open) markViewed(releaseViewId(release.id)); }}>
      <summary>
        <span>{release.title} {isUnseen(releaseViewId(release.id)) && <span className="unread-label">· New</span>}<small>{release.date}</small></span>
        <span className="muted">Read release</span>
      </summary>
      <div className="editorial-body">
        <p>At equal problem totals, your rank now depends on how early you solve the problems: less total time from publication to acceptance means a better rank.</p>
        <p>Each solved problem still earns one point. Each problem accepted at or after the next day’s 06:00 release, Guadalajara time, adds a one-time <strong>24-hour penalty</strong>. This rule also applies to your existing results.</p>
        <ul>
          <li>Faster solves on future problems can help you recover from a past delay, even if your rival keeps solving on time.</li>
          <li>Open your participant card to see what you need to reach the next rank. Recovery examples assume both participants solve the same new problems without adding late penalties.</li>
          <li>Your problem history shows how much time each solve contributes to your ranking, including any late penalty.</li>
          <li>Daily themes and instructions are more visible. Check them before solving: challenges such as No Sorting apply to both problems.</li>
          <li>Problem publication can run independently of score updates. Your score may update after the day’s problems appear.</li>
        </ul>
        <aside className="notice">
          <h3>Community editorials added</h3>
          <p>The Editorials tab now brings together approaches shared by participants, with explanations, implementations, and time / space complexity. Reviewed contributions appear after the problem’s daily window closes.</p>
          <p>Unread editorials are highlighted in gold so you can find new contributions. Open an editorial to mark it as read.</p>
        </aside>
      </div>
    </details>)}
  </section>;
}
