import React, { useEffect } from "react";
import { EventPage } from "./pages/EventPage";
import { NotFound } from "./pages/NotFound";
import { resolveRoute } from "./routing";

const EditionsPreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/EditionsPreview')) : null;
const WishActivationPreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/WishActivationPreview')) : null;
const WishAnnouncementPreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/WishAnnouncementPreview')) : null;
const AnswerChallengePreview = import.meta.env.DEV
  ? React.lazy(() => import('./dev/AnswerChallengePreview')) : null;

export function App() {
  const route = resolveRoute(window.location.pathname);
  useEffect(() => {
    if (route.kind === "redirect") {
      window.location.replace(`${route.currentPath}${window.location.search}${window.location.hash}`);
    }
  }, [route.kind, route.currentPath]);
  if (AnswerChallengePreview && new URLSearchParams(window.location.search).get('preview') === 'wish-challenge') {
    return <React.Suspense fallback={<p className="shell">Loading challenge preview…</p>}><AnswerChallengePreview /></React.Suspense>;
  }
  if (WishAnnouncementPreview && new URLSearchParams(window.location.search).get('preview') === 'wish-announcement') {
    return <React.Suspense fallback={<p className="shell">Loading announcement preview…</p>}><WishAnnouncementPreview /></React.Suspense>;
  }
  if (EditionsPreview && new URLSearchParams(window.location.search).get('preview') === 'editions') {
    return <React.Suspense fallback={<p className="shell">Loading local preview…</p>}><EditionsPreview /></React.Suspense>;
  }
  if (WishActivationPreview && new URLSearchParams(window.location.search).get('preview') === 'wish-design') {
    return <React.Suspense fallback={<p className="shell">Loading wish designs…</p>}><WishActivationPreview /></React.Suspense>;
  }
  if (route.kind === "redirect") return <p className="shell" role="status">Opening the latest edition…</p>;
  if (route.kind === "not-found") return <NotFound year={route.requestedYear} currentPath={route.currentPath} />;
  return <EventPage />;
}
