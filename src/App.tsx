import React, { useEffect } from "react";
import { EventPage } from "./pages/EventPage";
import { NotFound } from "./pages/NotFound";
import { resolveRoute } from "./routing";

export function App() {
  const route = resolveRoute(window.location.pathname);
  useEffect(() => {
    if (route.kind === "redirect") {
      window.location.replace(`${route.currentPath}${window.location.search}${window.location.hash}`);
    }
  }, [route.kind, route.currentPath]);
  if (route.kind === "redirect") return <p className="shell" role="status">Opening this year’s edition…</p>;
  if (route.kind === "not-found") return <NotFound year={route.requestedYear} currentPath={route.currentPath} />;
  return <EventPage />;
}
