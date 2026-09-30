import React from "react";
import { type Participant, type EventData } from "../data";
import { Timestamp } from "./Timestamp";

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
        {data.days.flatMap((day) =>
          day.problems.map((problem) => {
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
          }),
        )}
      </div>
    </details>
  );
}
