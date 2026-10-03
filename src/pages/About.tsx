import { selectedEdition } from "../editions";
import React from "react";
import { formURL } from "../data";
import { organizer } from "../content";

export function About({ now = Date.now() }: { now?: number }) {
  const form = formURL((selectedEdition.year === 2026 && import.meta.env.VITE_JOIN_FORM_URL) || selectedEdition.registrationUrl || undefined);
  // October 30 is included in full, in Guadalajara (UTC-6).
  const registrationOpen = !!form && !!selectedEdition.registrationCloseAt && now < Date.parse(selectedEdition.registrationCloseAt);
  return (
    <section className="about">
      <h2>Hello, I’m {organizer.name}.</h2>
      {organizer.biography && <p>{organizer.biography}</p>}
      <p>
        Codetober is a community initiative to encourage programming practice
        and interview preparation, one pair of problems at a time.
      </p>
      <p className="muted">
        This is an independent initiative and is not affiliated with or endorsed
        by LeetCode.
      </p>
      <h2>How it works</h2>
      <ul className="rules">
        <li>
          Two problems daily, October 1–31 at 06:00 Guadalajara time
          (<code>America/Mexico_City</code>).
        </li>
        <li>
          One point per unique problem, up to 62. Ties are broken by earlier accepted submissions.
        </li>
        <li>
          Accepted submissions count from release until November 1 at 06:00.
          Previously solved problems need a new accepted submission.
          After the event closes, results remain available as an archive; missed valid submissions can be corrected by the organizer.
        </li>
        <li>
          Keep your streak by solving at least one of that day’s problems before
          06:00 the next morning. One lights a <span className="rule-teal">teal</span> flame;
          both turn it <span className="rule-gold">gold</span>.
        </li>
        <li>
          Your streak stays active until the daily window closes. Late solves
          still earn points, but do not restore streaks or golden days.
        </li>
        <li>
          Best streak is your longest run; ties favor more golden days.
          Its flame reflects the share of golden days in that run.
        </li>
        <li>
          Updates run about hourly and may be delayed. Submission times determine
          results. LeetCode’s recent history is limited; contact the organizer
          about missing solves. No LeetCode login is needed.
        </li>
      </ul>
      <h2>Join the challenge</h2>
      <p>
        Send a request through the form. Responses go to a private applications
        sheet. Your registration is pending until the organizer approves you and
        adds you to the approved participant list.
      </p>
      <p className="notice">
        By joining, you understand that your public name, LeetCode username, and
        challenge progress will be visible to everyone.
      </p>
      {selectedEdition.registrationCloseAt && <p className="muted">Registration closes October 30, {selectedEdition.year} at 23:59, Guadalajara time.</p>}
      {registrationOpen ? (
        <p>
          <a className="form-link" href={form!} target="_blank" rel="noreferrer">
            Open registration form in a new tab ↗
          </a>
        </p>
      ) : (
        <p className="empty">{!form ? "Registration is not open yet." : "Registration is closed. Thank you for your interest!"}</p>
      )}
    </section>
  );
}
