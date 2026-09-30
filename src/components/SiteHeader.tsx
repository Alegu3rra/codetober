import React from "react";
import { eventName } from "../config";

export function SiteHeader() {
  return (
<header>
        <a
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
        </a>
        <a className="header-note" href="https://alegu3rra.github.io/">By: Alejandra Guerra</a>
      </header>
  );
}
