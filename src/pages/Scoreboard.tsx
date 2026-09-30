import React, { useState } from "react";
import { filterParticipants, type EventData } from "../data";
import { Timestamp } from "../components/Timestamp";
import { ParticipantDetails } from "../components/ParticipantDetails";

export function Scoreboard({
  data,
  now,
  zone,
}: {
  data: EventData;
  now: number;
  zone: string;
}) {
  const [query, setQuery] = useState("");
  const started = now >= Date.parse(data.event.startAt);
  const participants = filterParticipants(data.participants, query);
  return (
    <section>
      <p className="muted">
        {started ? "One problem, one point. Equal scores share a rank." : "Participants are registered. Rankings will appear when the challenge begins."}
      </p>
      <input
        id="search"
        aria-label="Find a participant"
        type="search"
        placeholder="Search name or username participant"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="muted" role="status">
        {participants.length}{" "}
        {participants.length === 1 ? "participant" : "participants"} · Challenge
        statistics only
      </p>
      {participants.map((person) => {
        const stale =
          !person.lastSyncedAt ||
          now - Date.parse(person.lastSyncedAt) > 2 * 3600000;
        return (
          <article className="participant" key={person.participant_id}>
            <div className="person-heading">
              {started && <span className="rank" aria-label={`Rank ${person.rank}`}>
                #{person.rank}
              </span>}
              <div>
                <h2>{person.display_name}</h2>
                <a
                  href={`https://leetcode.com/u/${encodeURIComponent(person.leetcode_username)}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{person.leetcode_username} ↗
                </a>
              </div>
            </div>
            <dl className="stats">
              <div>
                <dt>Problems</dt>
                <dd>
                  {person.problemsCompleted}
                  <small> / 62</small>
                </dd>
              </div>
              <div>
                <dt>Days complete</dt>
                <dd>{person.daysCompleted}</dd>
              </div>
              <div>
                <dt>Current streak</dt>
                <dd>{person.currentStreak}</dd>
              </div>
              <div>
                <dt>Best streak</dt>
                <dd>{person.bestStreak}</dd>
              </div>
            </dl>
            <progress
              max="62"
              value={person.problemsCompleted}
              aria-label={`${person.display_name}: ${person.problemsCompleted} of 62 problems`}
            />
            <p
              className={`sync-status ${person.syncFailed || stale ? "warning" : ""}`}
            >
              {person.syncFailed
                ? "⚠ Last query failed · "
                : stale
                  ? "⚠ Update overdue · "
                  : "✓ Synced · "}
              <Timestamp value={person.lastSyncedAt} zone={zone} />
            </p>
            <ParticipantDetails person={person} data={data} zone={zone} />
          </article>
        );
      })}
      {!participants.length && (
        <p className="empty">
          {data.participants.length
            ? "No participants match your search."
            : "No approved participants published yet."}
        </p>
      )}
      <p className="notice">
        LeetCode only exposes a limited list of recent accepted submissions. “No
        accepted submission recorded” does not mean a problem has never been
        solved. Existing results are kept when a query fails.
      </p>
    </section>
  );
}
