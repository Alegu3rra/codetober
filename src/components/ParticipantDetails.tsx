import React from "react";
import { elapsedLabel, problemRankingTime, type Editorial, type Participant, type EventData } from "../data";
import { Timestamp } from "./Timestamp";
import { StreakFlame } from "./StreakFlame";

export function ParticipantDetails({
  person,
  data,
  zone,
  contributions = [],
}: {
  person: Participant;
  data: EventData;
  zone: string;
  contributions?: Editorial[];
}) {
  const latestFirst = [...contributions].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const problemTitles = new Map(data.days.flatMap(day => day.problems.map(problem => [problem.titleSlug, problem.title] as const)));
  return (
    <div className="participant-details">
      <details className="participant-history">
        <summary>View problem history · {data.days.reduce((count, day) => count + day.problems.length, 0)} problems</summary>
        <div className="result-list">
          {data.days.length === 0 && <p>No problems published yet.</p>}
          {data.days.map((day) => (
            <section key={day.id} className="day-progress" aria-label={`Progress for ${day.date}`}>
              <h3>{day.date} {person.dayProgress && (() => {
                const count = person.dayProgress.find(d => d.date === day.date)?.onTimeProblems ?? 0;
                return <StreakFlame value={count} goldRatio={count === 2 ? 1 : 0}
                  label={`${day.date} · ${count} of 2 problems on time${count === 2 ? " · Golden day" : ""}`} />;
              })()}</h3>
              {day.problems.map((problem) => {
                const time = problemRankingTime(person, day, problem.titleSlug, data);
                const accepted = time?.acceptedAt ?? null;
                const editorial = latestFirst.find(entry => entry.titleSlug === problem.titleSlug);
                return (
                  <div className="result" key={problem.titleSlug}>
                    <div className="result-problem">
                      <a href={problem.url} target="_blank" rel="noreferrer">{problem.title} ↗</a>
                      {editorial && <a className="result-editorial-link" href={`#editorial-${editorial.id}`}>View editorial →</a>}
                    </div>
                    <span>
                      {accepted ? <>✓ Accepted · <Timestamp value={accepted} zone={zone} /></> : "— No accepted submission recorded"}
                    </span>
                    <span className={`result-time${time?.penaltySeconds ? ' result-time-late' : ''}`}
                      aria-label={`${problem.title}: ${time ? `${elapsedLabel(time.totalSeconds)} counted toward ranking time` : 'no ranking time recorded'}`}
                      title={time ? `${elapsedLabel(time.elapsedSeconds)} since publication${time.penaltySeconds ? ' + 24h late penalty' : ''}` : 'No accepted submission recorded; no time added'}>
                      {time ? elapsedLabel(time.totalSeconds) : '—'}
                      {time?.penaltySeconds ? <small>Includes +24h late</small> : null}
                    </span>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </details>
      {latestFirst.length > 0 && <details className="participant-history editorial-history">
        <summary>View editorial history · {latestFirst.length} {latestFirst.length === 1 ? 'contribution' : 'contributions'}</summary>
        <ol className="contribution-history">
          {latestFirst.map((entry, index) => (
            <li key={entry.id}>
              {index === 0 && <span className="latest-contribution">Latest</span>}
              <a href={`#editorial-${entry.id}`}>{problemTitles.get(entry.titleSlug) ?? entry.titleSlug} →</a>
              <span><Timestamp value={entry.publishedAt} zone={zone} /></span>
            </li>
          ))}
        </ol>
      </details>}
    </div>
  );
}
