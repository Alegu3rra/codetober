import React from "react";
import { type Day, type EventData } from "../data";
import { Timestamp } from "../components/Timestamp";
import { ProblemCards } from "../components/ProblemCards";
import { Countdown } from "../components/Countdown";

function dayNumber(day: Day) {
  return Number(day.date.slice(-2)).toString().padStart(2, "0");
}

export function Home({
  data,
  now,
  zone,
  editionNavigation,
}: {
  data: EventData;
  now: number;
  zone: string;
  editionNavigation?: React.ReactNode;
}) {
  const days = [...data.days].sort((a, b) => b.date.localeCompare(a.date));
  const publishedDates = new Set(days.map((d) => d.date));
  const next = data.event.schedule.find((day) => !publishedDates.has(day.date));
  const today = days.find((d) => {
    const nextRelease =
      data.event.schedule.find((s) => s.date > d.date)?.releaseAt ??
      data.event.closeAt;
    return now >= Date.parse(d.releaseAt) && now < Date.parse(nextRelease);
  });
  const beforeStart = now < Date.parse(data.event.startAt);
  const closed = now >= Date.parse(data.event.closeAt);
  return (
    <>
      <section className="release-strip" aria-label="Release schedule">
        <div>
          <span className="eyebrow">
            {closed
              ? "EVENT CLOSED"
              : beforeStart
                ? "THE CHALLENGE STARTS"
                : "NEXT RELEASE"}
          </span>
          <p>
            {closed ? (
              "The archive is here to stay. Keep practicing."
            ) : next ? (
              <Timestamp value={next.releaseAt} zone={zone} />
            ) : (
              "All 62 problems have been released."
            )}
          </p>
        </div>
        <div className={editionNavigation ? "edition-release-actions" : undefined}>
        {!closed &&
          next &&
          (Date.parse(next.releaseAt) > now ? (
            <Countdown target={next.releaseAt} now={now} />
          ) : (
            <span className="muted">Awaiting publication</span>
          ))}
        {editionNavigation}
        </div>
      </section>
      {!beforeStart && !closed && (
        <section>
          <div className="section-heading">
            <h2>Today’s problems</h2>
            {today && <span className="muted">DAY {dayNumber(today)}</span>}
          </div>
          {today ? (
            <>
              <p className="muted">{today.title}</p>
              <ProblemCards day={today} />
            </>
          ) : (
            <p className="empty">
              Today’s problems have not been published yet. Automated releases
              may be delayed.
            </p>
          )}
        </section>
      )}
      {/* {beforeStart && (
        <p className="notice">
          Problems will appear after their scheduled release. Come back on
          October 1 at 06:00, Guadalajara time.
        </p>
      )} */}
      <section>
        <div className="section-heading">
          <h2>Problems</h2>
          <span className="muted">{days.length} / 31 DAYS</span>
        </div>
        {!days.length ? (
          <p className="empty">
            No problems published yet. The first pair is on its way.
          </p>
        ) : (
          days.map((day) => (
            <details className="archive-day" key={day.id}>
              <summary>
                <span className="day-label">DAY {dayNumber(day)}</span>
                <span>{day.title}</span>
                <span className="archive-date">
                  {day.date.slice(5)} · 2 problems
                </span>
              </summary>
              <ProblemCards day={day} />
            </details>
          ))
        )}
      </section>
    </>
  );
}
