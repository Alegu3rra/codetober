import React, { useState } from "react";
import { filterParticipants, type EventData } from "../data";
import { ParticipantRow } from "../components/ParticipantRow";
import { orderedParticipants } from "../data";

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
  const participants = filterParticipants(orderedParticipants(data), query);
  return (
    <section>
      <p className="muted">
        {started ? "One problem, one point. Ties are broken by earlier accepted submissions." : "Participants are registered. Rankings will appear when the challenge begins."}
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
      {participants.map(person => <ParticipantRow key={person.participant_id} person={person} data={data} now={now} zone={zone} started={started} />)}
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
