import React, { useEffect } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { configuredZone } from "../config";

export function NotFound({ year, currentPath }: { year: number | null; currentPath: string }) {
  useEffect(() => { document.title = "404 not found · Codetober"; }, []);
  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="intro">
          <p className="eyebrow">CODETOBER ARCHIVE</p>
          <h1><span>404</span> not found</h1>
          <p>{year ? `The ${year} edition is not available.` : "The page you’re looking for is not available."}</p>
          <a className="form-link" href={currentPath}>Go to this year’s edition ↗</a>
        </section>
      </main>
      <SiteFooter zone={configuredZone} />
    </div>
  );
}
