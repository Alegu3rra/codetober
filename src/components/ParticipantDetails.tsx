import React from "react";
import { type Participant, type EventData } from "../data";
import { Timestamp } from "./Timestamp";
import { StreakFlame } from "./StreakFlame";

export function ParticipantDetails({
  person,
  data,
  zone,
}: {
  person: Participant;
  data: EventData;
  zone: string;
}) {
  return (
    <details className="participant-details">
      <summary>View recorded progress</summary>
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
            const accepted =
              person.results.find((r) => r.titleSlug === problem.titleSlug)
                ?.firstAcceptedAt ?? null;
            return (
              <div className="result" key={problem.titleSlug}>
                <a href={problem.url} target="_blank" rel="noreferrer">
                  {problem.title} ↗
                </a>
                <span>
                  {accepted ? (
                    <>
                      ✓ Accepted · <Timestamp value={accepted} zone={zone} />
                    </>
                  ) : (
                    "— No accepted submission recorded"
                  )}
                </span>
              </div>
            );
          })}
          </section>
        ))}
      </div>
    </details>
  );
}
