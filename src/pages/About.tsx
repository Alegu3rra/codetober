import React from "react";
import { formURL } from "../data";
import { organizer } from "../content";

export function About({ now = Date.now() }: { now?: number }) {
  const form = formURL(import.meta.env.VITE_JOIN_FORM_URL) || "https://forms.gle/F4ugB4s2nxjvi1Av8";
  // October 30 is included in full, in Guadalajara (UTC-6).
  const registrationOpen = now < Date.parse("2026-10-31T00:00:00-06:00");
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
          Two problems are released together at 06:00 each day, October 1–31, in
          Guadalajara (<code>America/Mexico_City</code>).
        </li>
        <li>
          Each unique problem earns one point, up to 62. Both problems earn a
          completed day. Equal totals share a rank; names order tied entries.
        </li>
        <li>
          An accepted submission must be at or after the problem’s release and
          before November 1, 2026 at 06:00. Previously solved problems need a
          new accepted submission within this window.
        </li>
        <li>
          A day is on time when both problems are accepted before 06:00 the
          following morning. Consecutive on-time days build your streak. An open
          day does not break it.
        </li>
        <li>
          Late solves earn points and completed days, but do not rebuild an
          on-time streak. Your best streak records your longest on-time
          sequence.
        </li>
        <li>
          Public LeetCode activity is checked about hourly. Queries, releases
          and deployment can be delayed. Results use submission times, not query
          times.
        </li>
        <li>
          The recent accepted list is limited. Missed submissions can be
          reviewed and corrected by the organizer. No password, cookies, or
          LeetCode session is needed.
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
      <p className="muted">Registration closes October 30, 2026 at 23:59, Guadalajara time.</p>
      {registrationOpen ? (
        <p>
          <a className="form-link" href={form} target="_blank" rel="noreferrer">
            Open registration form in a new tab ↗
          </a>
        </p>
      ) : (
        <p className="empty">Registration is closed. Thank you for your interest!</p>
      )}
    </section>
  );
}
