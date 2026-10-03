import { selectedEdition, emptyEditionData } from "../editions";
import { useEffect, useState } from "react";
import { dataSchema, dataURL, type EventData } from "../data";

export function useEventData() {
  const mode = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("preview") : null;
  const preview = mode === "1" || mode === "closed";
  const previewTime = Date.parse(mode === "closed" ? "2026-11-02T12:00:00Z" : "2026-10-03T18:00:00Z");
  const [data, setData] = useState<EventData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(preview ? previewTime : Date.now());
  useEffect(() => {
    if (preview) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [preview]);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    async function refresh() {
      try {
        if (import.meta.env.DEV && preview) {
          const fixture = mode === "closed"
            ? (await import("../dev/closed-preview")).closedPreviewData
            : (await import("../dev/preview")).previewData;
          const next = dataSchema.parse(fixture);
          if (!disposed) { setData(next); setError(false); }
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
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
    };
  }, [attempt, preview, mode]);
  return { data, error, loading, now, retry: () => setAttempt((a) => a + 1) };
}
