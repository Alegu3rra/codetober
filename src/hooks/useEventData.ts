import { selectedEdition, emptyEditionData } from "../editions";
import { useEffect, useState } from "react";
import { dataSchema, type EventData } from "../data/schema";
import { dataURL } from "../data/urls";

export function useEventData() {
  const mode = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("preview") : null;
  const preview = mode === "1" || mode === "closed" || mode === "editorials" || !!mode?.startsWith("wish");
  const wishTimes: Record<string, string> = { wish: "2026-10-25T15:00:00Z", "wish-upcoming": "2026-10-23T18:00:00Z", "wish-review": "2026-10-26T13:00:00Z", "wish-tie": "2026-10-26T13:00:00Z", "wish-winner": "2026-10-26T14:00:00Z" };
  const previewTime = Date.parse((mode === 'wish-challenge' || mode === 'wish-validator') ? '2026-10-31T13:00:00Z' : mode === 'wish-announcement' ? '2026-10-27T00:29:42.673Z' : mode && wishTimes[mode] ? wishTimes[mode] : mode === "closed" ? "2026-11-02T12:00:00Z" : "2026-10-03T18:00:00Z");
  const [data, setData] = useState<EventData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(preview ? previewTime : Date.now());
  useEffect(() => {
    if (preview) return;
    const end=Date.parse(data?.event.closeAt??selectedEdition.closeAt);
    if(Date.now()>=end){setNow(Date.now());return;}
    const timer = setInterval(() => {const time=Date.now();setNow(time);if(time>=end)clearInterval(timer);}, 1000);
    return () => clearInterval(timer);
  }, [preview,data?.event.closeAt]);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    async function refresh() {
      try {
        if (import.meta.env.DEV && preview) {
          const fixture = mode === 'wish-validator-local'
            ? await (await import('../dev/local-validator-preview')).localValidatorPreview(controller.signal)
            : mode === 'wish-validator'
            ? (await import('../dev/validator-preview-data')).validatorPreviewData
            : mode === 'wish-challenge'
            ? (await import('../dev/challenge-preview-data')).challengePreviewData
            : mode === 'wish-announcement'
            ? JSON.parse((await import('../dev/announcement-snapshot.json?raw')).default)
            : mode?.startsWith("wish")
            ? (await import("../dev/wish-preview")).wishPreviewData(mode)
            : mode === "editorials"
            ? (await import("../dev/editorials-preview")).editorialsPreviewData
            : mode === "closed"
            ? (await import("../dev/closed-preview")).closedPreviewData
            : (await import("../dev/preview")).previewData;
          const next = dataSchema.parse(fixture);
          if (!disposed) { setData(next); setError(false); if(mode==='wish-validator-local')setNow(Date.parse(next.generatedAt)); }
          return;
        }
        if (!selectedEdition.snapshot) {
          if (!disposed) { setData(emptyEditionData()); setError(false); }
          return;
        }
        const response = await fetch(dataURL(), {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Data unavailable");
        const next = dataSchema.parse(await response.json());
        if (Date.parse(next.event.startAt) !== Date.parse(selectedEdition.startAt)
          || Date.parse(next.event.closeAt) !== Date.parse(selectedEdition.closeAt)) throw new Error("Wrong edition snapshot");
        if (!disposed) {
          setData(next);
          setError(false);
        }
      } catch {
        if (!disposed) setError(true);
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    let timer:ReturnType<typeof setTimeout>|undefined;
    async function run() {
      await refresh();
      if(!disposed&&!preview)timer=setTimeout(()=>void run(),Date.now()>=Date.parse(selectedEdition.closeAt)?15*60000:60000);
    }
    void run();
    return () => {
      disposed = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [attempt, preview, mode]);
  return { data, error, loading, now, retry: () => setAttempt((a) => a + 1) };
}
