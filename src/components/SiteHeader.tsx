import { editions, selectedEdition, editionURL } from "../editions";
import React from "react";
import { communityViewId, useContentIndicators } from "../hooks/useViewedContent";
import { eventName } from "../config";
import type { ExtraordinaryEvent } from '../../shared/extraordinary-events.mjs';
import { RecoveryCountdown } from './RecoveryCountdown';

export function SiteHeader({ recoveryWindow, now = Date.now() }: { recoveryWindow?: ExtraordinaryEvent; now?: number }) {
  const { isUnseen, markViewed } = useContentIndicators();
  const communityIsNew = isUnseen(communityViewId);
  return (
<header className="site-header">
        <RecoveryCountdown window={recoveryWindow} now={now} banner />
        <div className="shell site-header-content">
        {editions.length > 1 ? <div className="edition-heading">
          <span aria-hidden="true">[</span><span className="edition-typing">
            <a href={editionURL(selectedEdition.year)}>Codetober</a>
            <select className="edition-select" aria-label="Choose edition" value={selectedEdition.year}
              onChange={e => window.location.assign(editionURL(Number(e.target.value)))}>
              {[...editions].reverse().map(e => <option key={e.year} value={e.year}>{e.year}</option>)}
            </select>
          </span><span aria-hidden="true">]</span>
        </div> : <a
          href={import.meta.env.BASE_URL}
          className="brand"
          style={{ "--title-length": eventName.length } as React.CSSProperties}
          aria-label={`${eventName} home`}
        >
          <span aria-hidden="true">[</span>
          <span className="brand-title" aria-hidden="true">
            <span className="brand-typed">{eventName}</span>
          </span>
          <span aria-hidden="true">]</span>
        </a>}
        <div className="header-actions">
          <a href="#community" className={`community-header-link${communityIsNew ? ' has-unseen-content' : ''}`}
            aria-label="WhatsApp community" aria-description={communityIsNew ? 'New community invitation' : undefined}
            title="WhatsApp community" onClick={() => markViewed(communityViewId)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M20.5 11a8.5 8.5 0 0 1-12.6 7.5L3 20l1.5-4.9A8.5 8.5 0 1 1 20.5 11Z" />
              <path d="M8 11h.01M12 11h.01M16 11h.01" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
            {communityIsNew && <span className="community-new-dot" aria-hidden="true" />}
          </a>
        </div>
        </div>
      </header>
  );
}
