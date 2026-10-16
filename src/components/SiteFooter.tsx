import React from "react";
import { type EventData } from "../data/schema";
import { organizer } from "../content";
import { Timestamp } from "./Timestamp";

export function SiteFooter({ data, zone }: { data?: EventData | null; zone: string }) {
  return (
      <footer>
        <p>Practice. Learn. Repeat.</p>
        {data !== undefined && <p>
          Last successful sync:{" "}
          <Timestamp value={data?.lastSuccessfulSyncAt ?? null} zone={zone} />
          {data && (data.lastSuccessfulSyncAt || data.days.length > 0) && (
            <>
              {" "}
              · Snapshot: <Timestamp value={data.generatedAt} zone={zone} />
            </>
          )}
        </p>}
        <p>All times: {zone}. Releases and updates may be delayed.</p>
        <p>Independent community initiative · Not affiliated with LeetCode.</p>
        <p>By <a href="https://alegu3rra.github.io/">{organizer.name}</a></p>
      </footer>
  );
}
