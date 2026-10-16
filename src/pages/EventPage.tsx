import { recoveryEventFor } from "../../shared/extraordinary-events.mjs";
import { ViewedContentContext, useViewedContent, communityViewId, editorialViewId, releaseViewId } from "../hooks/useViewedContent";
import { selectedEdition, latestYear, editionURL, previousEdition } from "../editions";
import React, { useEffect, useRef, useState } from "react";
import { Editorials } from "./Editorials";
import { Releases, releaseNotes } from "./Releases";
import { Extraordinary } from "./Extraordinary";
import { Home } from "./Home";
import { About } from "./About";
import { Scoreboard } from "./Scoreboard";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useEventData } from "../hooks/useEventData";
import { eventName, configuredZone } from "../config";

const regularTabs = ["Problems", "Scoreboard", "Editorials", "Releases", "About / Join"] as const;

export function EventPage() {
  const [active, setActive] = useState(window.location.hash === '#community' ? 4 : window.location.hash === '#extraordinarios' ? 5 : window.location.hash.startsWith('#editorial') ? 2 : 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityNavigation, setCommunityNavigation] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [editorialHash, setEditorialHash] = useState(window.location.hash);
  useEffect(() => {
    const navigate = () => {
      if (window.location.hash === '#community') { setActive(4); setMenuOpen(false); setCommunityNavigation(value => value + 1); }
      else if (window.location.hash === '#extraordinarios') { setActive(5); setMenuOpen(false); }
      else if (window.location.hash.startsWith('#editorial')) { setActive(2); setEditorialHash(window.location.hash); setMenuOpen(false); }
      else setActive(0);
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const { data, error, loading, now, retry } = useEventData();
  const event = recoveryEventFor(data?.event.extraordinaryEvents, now);
  const showExtraordinary = !!event && (now < Date.parse(event.endAt) || window.location.hash === '#extraordinarios');
  const tabs: readonly string[] = showExtraordinary ? [...regularTabs, event.title] : regularTabs;
  const selected = active < tabs.length ? active : 0;
  useEffect(() => {
    if (selected !== 4 || window.location.hash !== '#community') return;
    const invitation = document.getElementById('community');
    // The browser's initial anchor jump runs while the destination tab is still hidden.
    invitation?.focus({ preventScroll: true });
    invitation?.scrollIntoView?.({ block: 'start', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [selected, communityNavigation]);
  const preview = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null;
  const viewed = useViewedContent(`codetober:viewed:v1:${selectedEdition.year}:${preview ? `preview-${preview}` : 'live'}`);
  const newEditorials = data?.editorials?.some(e => viewed.isUnseen(editorialViewId(e.id))) ?? false;
  const newReleases = releaseNotes.some(release => release.year === selectedEdition.year && viewed.isUnseen(releaseViewId(release.id)));
  const newCommunity = viewed.isUnseen(communityViewId);
  useEffect(() => {
    if (selected === 4 && newCommunity) viewed.markViewed(communityViewId);
  }, [selected, newCommunity, viewed.markViewed]);
  const unreadTab = (index: number) => (index === 2 && newEditorials) || (index === 3 && newReleases) || (index === 4 && newCommunity);
  const nav = useRef<HTMLDivElement>(null);
  useEffect(() => { document.title = eventName; }, []);
  const previous = previousEdition(now);
  const zone = data?.event.timezone || configuredZone;
  function activateTab(index: number, closeMenu = true) {
    if (index !== 2 && (window.location.hash.startsWith('#editorial') || window.location.hash === '#extraordinarios' || window.location.hash === '#community')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setEditorialHash('');
    }
    if (index === 5) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#extraordinarios`);
    setActive(index);
    if (closeMenu) setMenuOpen(false);
  }
  function keyboard(event: React.KeyboardEvent) {
    if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); return; }
    const destination =
      (event.key === "ArrowRight" || event.key === "ArrowDown")
        ? (selected + 1) % tabs.length
        : (event.key === "ArrowLeft" || event.key === "ArrowUp")
          ? (selected + tabs.length - 1) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (destination !== null) {
      event.preventDefault();
      activateTab(destination, false);
      nav.current?.querySelectorAll("button")[destination].focus();
    }
  }
  return (
    <ViewedContentContext.Provider value={viewed}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader recoveryWindow={showExtraordinary ? event : undefined} now={now} />
      <div className="shell">
      <nav aria-label="Primary" className={menuOpen ? 'primary-nav menu-open' : 'primary-nav'}>
        <button ref={menuButton} type="button" className="mobile-menu-toggle" aria-label="Toggle navigation menu"
          aria-expanded={menuOpen} aria-controls="primary-tabs" onClick={() => setMenuOpen(open => !open)}>
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span> <span>Menu</span><span className="muted">{tabs[selected]}</span>
        </button>
        <div
          className="tabs"
          id="primary-tabs"
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
              className={unreadTab(i) ? 'has-unseen-content' : undefined}
              aria-label={tab}
              aria-description={unreadTab(i) ? "Unread content" : undefined}
              aria-selected={selected === i}
              aria-controls={`panel-${i}`}
              tabIndex={selected === i ? 0 : -1}
              onClick={() => activateTab(i)}
            >
              {tab} {unreadTab(i) ? <span className="unread-label" aria-hidden="true">· New</span> : null}
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
            hidden={selected !== i}
            tabIndex={0}
          >
            {i === 5 && data && event ? (
              <Extraordinary data={data} event={event} now={now} zone={zone} />
            ) : i === 4 ? (
              <About now={now} />
            ) : i === 3 ? (
              <Releases />
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
