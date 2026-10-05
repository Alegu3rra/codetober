import { ViewedContentContext, useViewedContent, editorialViewId } from "../hooks/useViewedContent";
import { selectedEdition, latestYear, editionURL, previousEdition } from "../editions";
import React, { useEffect, useRef, useState } from "react";
import { Editorials } from "./Editorials";
import { Home } from "./Home";
import { About } from "./About";
import { Scoreboard } from "./Scoreboard";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useEventData } from "../hooks/useEventData";
import { eventName, configuredZone } from "../config";

const tabs = ["Problems", "Scoreboard", "Editorials", "About / Join"] as const;

export function EventPage() {
  const [active, setActive] = useState(window.location.hash.startsWith('#editorial') ? 2 : 0);
  const [editorialHash, setEditorialHash] = useState(window.location.hash);
  useEffect(() => {
    const navigate = () => { if (window.location.hash.startsWith('#editorial')) { setActive(2); setEditorialHash(window.location.hash); } };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const { data, error, loading, now, retry } = useEventData();
  const preview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null;
  const viewed = useViewedContent(`codetober:viewed:v1:${selectedEdition.year}:${preview ? `preview-${preview}` : 'live'}`);
  const newEditorials = data?.editorials?.some(e => viewed.isUnseen(editorialViewId(e.id))) ?? false;
  const nav = useRef<HTMLDivElement>(null);
  useEffect(() => { document.title = eventName; }, []);
  const previous = previousEdition(now);
  const zone = data?.event.timezone || configuredZone;
  function activateTab(index: number) {
    if (index !== 2 && window.location.hash.startsWith('#editorial')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setEditorialHash('');
    }
    setActive(index);
  }
  function keyboard(event: React.KeyboardEvent) {
    const destination =
      event.key === "ArrowRight"
        ? (active + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (active + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (destination !== null) {
      event.preventDefault();
      activateTab(destination);
      nav.current?.querySelectorAll("button")[destination].focus();
    }
  }
  return (
    <ViewedContentContext.Provider value={viewed}><div className="shell">
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
              className={(i === 2 && newEditorials) ? 'has-unseen-content' : undefined}
              aria-label={tab}
              aria-description={(i === 2 && newEditorials) ? "Unread content" : undefined}
              aria-selected={active === i}
              aria-controls={`panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => activateTab(i)}
            >
              {tab} {(i === 2 && newEditorials) ? <span className="unread-label" aria-hidden="true">· New</span> : null}
            </button>
          ))}
        </div>
      </nav>
      <main id="main" tabIndex={-1}>
        {selectedEdition.year !== latestYear && <p className="notice">Viewing the {selectedEdition.year} archive. <a href={editionURL(latestYear)}>Go to latest edition →</a></p>}
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
            {i === 3 ? (
              <About now={now} />
            ) : i === 2 ? (
              <Editorials data={data} loading={loading} error={error} hash={editorialHash} />
            ) : loading && !data ? (
              <p className="empty" role="status">
                Loading challenge data…
              </p>
            ) : data ? (
              i === 0 ? (
                <Home data={data} now={now} zone={zone} editionNavigation={selectedEdition.year === latestYear && previous ? <a href={editionURL(previous.year)}>View previous edition →</a> : undefined} />
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
    </div></ViewedContentContext.Provider>
  );
}
