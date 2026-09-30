import React from "react";
import { eventName } from "../config";

export function SiteHeader() {
  return (
<header>
        <a
          href={import.meta.env.BASE_URL}
          className="brand"
          aria-label={`${eventName} home`}
        >
          <span aria-hidden="true">[</span> {eventName}{" "}
          <span aria-hidden="true">]</span>
        </a>
        <span className="header-note">By: Alejandra Guerra</span>
      </header>
  );
}
