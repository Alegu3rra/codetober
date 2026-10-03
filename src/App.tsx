import React, { useEffect } from "react";
import { EventPage } from "./pages/EventPage";
import { NotFound } from "./pages/NotFound";
import { resolveRoute } from "./routing";

const EditionsPreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/EditionsPreview')) : null;

export function App() {
  const route = resolveRoute(window.location.pathname);
  useEffect(() => {
    if (route.kind === "redirect") {
      window.location.replace(`${route.currentPath}${window.location.search}${window.location.hash}`);
    }
  }, [route.kind, route.currentPath]);
  if (EditionsPreview && new URLSearchParams(window.location.search).get('preview') === 'editions') {
    return <React.Suspense fallback={<p className="shell">Loading local preview…</p>}><EditionsPreview /></React.Suspense>;
  }
  if (route.kind === "redirect") return <p className="shell" role="status">Opening the latest edition…</p>;
  if (route.kind === "not-found") return <NotFound year={route.requestedYear} currentPath={route.currentPath} />;
  return <EventPage />;
}
