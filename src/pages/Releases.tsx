import React from 'react';
import { selectedEdition } from '../editions';
import { releaseViewId, useContentIndicators } from '../hooks/useViewedContent';

export const releaseNotes = [
  { id: '2026-release-7', year: 2026, title: 'Release 7 · A weekend of second chances & wishes', date: 'October 23, 2026', kind: 'wishes' },
  { id: '2026-release-6', year: 2026, title: 'Release 6 · Stay connected', date: 'October 16, 2026', kind: 'community' },
  { id: '2026-release-5', year: 2026, title: 'Release 5 · Extraordinarios weekend', date: 'October 16, 2026', kind: 'recovery' },
  { id: '2026-release-4', year: 2026, title: 'Release 4 · Your practice, your tags', date: 'October 11, 2026', kind: 'badges' },
  { id: '2026-release-3', year: 2026, title: 'Release 3 · Share an approach, earn an hour', date: 'October 8, 2026', kind: 'editorial-credit' },
  { id: '2026-release-2', year: 2026, title: 'Release 2 · Earlier solves, better ranks', date: 'October 8, 2026', kind: 'ranking' },
  { id: '2026-editorials-release-1', year: 2026, title: 'Release 1 · Community editorials', date: 'October 5, 2026', kind: 'editorials' },
];

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
        {release.kind === 'wishes' ? <>
          <h3>Extraordinarios returns · Make a Wish arrives</h3>
          <p>Extraordinarios opens again October 24 at 06:00 through October 26 at 06:00, Guadalajara time. Eligible pending problems count as 24 hours total with no extra late penalty. Credits from the first recovery weekend stay.</p>
          <p>On Sunday October 25, complete both daily problems during their official window to earn a wish for the community. The second accepted submission determines completion time; the first breaks ties. Exact ties are reviewed by email to determine one wish.</p>
          <p>Explore five educational wish proposals and their visual guides in the Make a Wish tab. The confirmed winner sends their choice from their registration email within 24 hours. Benefits start after organizer approval and announcement.</p>
        </> : release.kind === 'community' ? <>
          <h3>The WhatsApp community is here</h3>
          <p>Find announcements and reminders through the small chat icon in the header or the invitation beside challenge registration in About / Join.</p>
          <ul>
            <li>The invitation includes a direct join link and a clean, downloadable QR code.</li>
            <li>Gold highlights in the header and About / Join indicate the new invitation. Opening it clears both highlights for this browser.</li>
            <li>The header icon opens About / Join and scrolls directly to the invitation.</li>
            <li>The organizer credit now appears in the footer. Joining WhatsApp is optional and separate from challenge registration.</li>
          </ul>
        </> : release.kind === 'recovery' ? <>
          <h3>Catch up with extraordinarios</h3>
          <p>October 17 at 06:00 through October 19 at 06:00, 2026, Guadalajara time. The start is included; the end is excluded.</p>
          <p>Problems whose daily window has closed by the start of the weekend and that you still have pending can be recovered. Your first accepted submission during this period counts as <strong>24 hours total per problem</strong>, with no accumulated delay and no additional late penalty.</p>
          <ul>
            <li>The benefit stays after the weekend. Submission timestamps determine eligibility, even if synchronization happens later.</li>
            <li>Earlier accepted submissions keep their existing time; resubmitting does not qualify them.</li>
            <li>October 17–18 problems keep their normal daily rules. Problems accepted at or after October 19 at 06:00 also keep normal rules.</li>
            <li>Each recovered problem earns its usual point. Recovery does not restore on-time credit, streaks, or golden days. Editorial credits still apply separately.</li>
          </ul>
        </> : release.kind === 'badges' ? <>
          <h3>Participant tags recognize your practice</h3>
          <p>Your card now highlights practice topics, consistency, community contributions, and extra practice. Focus, tap, or hover over a tag to see its criteria and the observed activity behind it. Expand your card to see all your tags.</p>
          <ul>
            <li>Topic tags start at two distinct accepted problems. Three, including a Medium or Hard, earn the strong-topic level. They describe problem topics, not the technique used in your code.</li>
            <li>A golden week requires seven consecutive days with both problems accepted on time.</li>
            <li>Extra practice counts distinct problems outside the event calendar after both daily problems are accepted on time and before the next 06:00 release. Recent accepted submissions are a limited observation, not a complete history.</li>
            <li>Closely spaced accepts describe submission timing. They do not measure solving time or demonstrate AI use.</li>
            <li>Tags recognize activity without changing points or ranking time. Complete topic collections are awarded at event closure.</li>
          </ul>
          <p>Try first. Getting help is welcome; understanding and explaining your solution is the real win.</p>
        </> : release.kind === 'editorial-credit' ? <>
          <h3>Validated editorials now reduce ranking time</h3>
          <p>Share an implementation different from those already published for the same problem. Once your editorial is reviewed, validated, and published, you earn <strong>one hour off your total ranking time</strong>.</p>
          <ul>
            <li>The organizer must confirm that the implementation is different. Publication alone does not grant the credit.</li>
            <li>Each validated contribution earns one hour once. Editing an editorial or refreshing results does not grant another hour.</li>
            <li>Previously published editorials can also earn credit after review. Credits appear in the next score update after validation.</li>
            <li>Your participant card shows your editorial credit separately. Ranking time includes the deduction and has a minimum of zero.</li>
            <li>Problem totals and streaks stay the same. At equal problem totals, editorial credits can help you move up.</li>
          </ul>
          <p>Visit the Editorials tab to submit your approach. Reviewed contributions become public after the problem’s daily window closes.</p>
        </> : release.kind === 'editorials' ? <>
          <h3>Community editorials added</h3>
          <p>The Editorials tab brings together approaches shared by participants, with explanations, implementations, and time / space complexity.</p>
          <p>Submit your approach for review and share another way to solve the challenge. Published contributions are credited to their authors and appear after the problem’s daily window closes.</p>
        </> : <>
        <p>At equal problem totals, your rank now depends on how early you solve the problems: less total time from publication to acceptance means a better rank.</p>
        <p>Each solved problem still earns one point. Each problem accepted at or after the next day’s 06:00 release, Guadalajara time, adds a one-time <strong>24-hour penalty</strong>. This rule also applies to your existing results.</p>
        <ul>
          <li>Faster solves on future problems can help you recover from a past delay, even if your rival keeps solving on time.</li>
          <li>Open your participant card to see what you need to reach the next rank. Recovery examples assume both participants solve the same new problems without adding late penalties.</li>
          <li>Your problem history shows how much time each solve contributes to your ranking, including any late penalty.</li>
          <li>Daily themes and instructions are more visible. Check them before solving: challenges such as No Sorting apply to both problems.</li>
          <li>Problem publication can run independently of score updates. Your score may update after the day’s problems appear.</li>
        </ul>
        </>}
      </div>
    </details>)}
  </section>;
}
