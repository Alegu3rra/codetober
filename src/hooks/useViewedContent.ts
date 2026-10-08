import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export const editorialViewId = (id: string) => `editorial:${id}`;
export const releaseViewId = (id: string) => `release:${id}`;
function readSeen(key: string): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((id): id is string => typeof id === 'string' && id.length <= 250));
  } catch { return new Set(); }
}
export function useViewedContent(key: string) {
  const [state, setState] = useState(() => ({key, seen: readSeen(key)}));
  const seen = state.key === key ? state.seen : readSeen(key);
  useEffect(() => {
    setState({key, seen: readSeen(key)});
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) setState({key, seen: readSeen(key)});
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);
  const markViewed = useCallback((id: string) => {
    setState(previous => {
      const next = new Set([...(previous.key === key ? previous.seen : []), ...readSeen(key), id]);
      // Storage may be disabled: the indicator still clears for this visit.
      try { localStorage.setItem(key, JSON.stringify([...next])); } catch { /* Keep in memory. */ }
      if (previous.key === key && previous.seen.size === next.size && [...next].every(v => previous.seen.has(v))) return previous;
      return {key, seen: next};
    });
  }, [key]);
  return { isUnseen: (id: string) => !seen.has(id), markViewed };
}
export const ViewedContentContext = createContext<{isUnseen: (id: string) => boolean; markViewed: (id: string) => void}>({isUnseen: (_id: string) => false, markViewed: (_id: string) => {}});
export const useContentIndicators = () => useContext(ViewedContentContext);
