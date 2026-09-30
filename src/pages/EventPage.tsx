import React, { useEffect, useRef, useState } from "react";
import { Home } from "./Home";
import { About } from "./About";
import { Scoreboard } from "./Scoreboard";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useEventData } from "../hooks/useEventData";
import { eventName, configuredZone } from "../config";

const tabs = ["Problems", "Scoreboard", "About / Join"] as const;

export function EventPage() {
  const [active, setActive] = useState(0);
  const { data, error, loading, now, retry } = useEventData();
  const nav = useRef<HTMLDivElement>(null);
  useEffect(() => { document.title = eventName; }, []);
  const zone = data?.event.timezone || configuredZone;
  function keyboard(event: React.KeyboardEvent) {
    const destination =
      event.key === "ArrowRight"
        ? (active + 1) % 3
        : event.key === "ArrowLeft"
          ? (active + 2) % 3
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : null;
    if (destination !== null) {
      event.preventDefault();
      setActive(destination);
      nav.current?.querySelectorAll("button")[destination].focus();
    }
  }
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <nav aria-label="Primary">
        <div
          className="tabs"
          role="tablist"
          aria-label="Main navigation"
          ref={nav}
          onKeyDown={keyboard}
        >
          {tabs.map((tab, i) => (
            <button
              key={tab}
              id={`tab-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls={`panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main id="main" tabIndex={-1}>
        <h1 className="sr-only">{eventName}</h1>
        {data?.demo && (
          <p className="notice">
            Local demo · Fictional participants and simulated dates. These are
            not live event results.
          </p>
        )}
        {error && (
          <div className="notice warning" role="alert">
            Could not load the latest data.{" "}
            {data
              ? "Showing the last loaded snapshot."
              : "Please try again shortly."}{" "}
            <button onClick={retry}>Retry</button>
          </div>
        )}
        {data?.participantsFailed && (
          <p className="notice warning">
            Participant updates are delayed. The last valid approved participant
            list is shown.
          </p>
        )}
        {/* {data && now - Date.parse(data.generatedAt) > 2 * 3600000 && <p className="notice warning">This snapshot is over two hours old. Releases and results may be delayed.</p>} */}
        {tabs.map((_, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`panel-${i}`}
            aria-labelledby={`tab-${i}`}
            hidden={active !== i}
            tabIndex={0}
          >
            {i === 2 ? (
              <About />
            ) : loading && !data ? (
              <p className="empty" role="status">
                Loading challenge data…
              </p>
            ) : data ? (
              i === 0 ? (
                <Home data={data} now={now} zone={zone} />
              ) : (
                <Scoreboard data={data} now={now} zone={zone} />
              )
            ) : !error ? (
              <p className="empty">No data available yet.</p>
            ) : null}
          </div>
        ))}
      </main>
      <SiteFooter data={data} zone={zone} />
    </div>
  );
}
