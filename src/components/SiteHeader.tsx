import { editions, selectedEdition, editionURL } from "../editions";
import React from "react";
import { eventName } from "../config";

export function SiteHeader() {
  return (
<header>
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
        <a className="header-note" href="https://alegu3rra.github.io/">By: Alejandra Guerra</a>
      </header>
  );
}
