import { selectedEdition, editionURL } from "../editions";

export function dataURL(base = (selectedEdition.year === 2026 && import.meta.env.VITE_PUBLIC_DATA_BASE_URL) || `${editionURL(selectedEdition.year)}${selectedEdition.snapshot?.replace(/data.json$/, "") || "data/"}`) {
  const url = new URL(base.endsWith('/') ? base : `${base}/`, window.location.href);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid data URL');
  return new URL('data.json', url).href;
}
export function formURL(value: string | undefined, embed = false) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')) return url.href;
    if (!embed && url.hostname === 'forms.gle') return url.href;
  } catch { /* Invalid form configuration is presented as unavailable. */ }
  return null;
}

