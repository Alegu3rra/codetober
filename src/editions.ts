import configuredRegistry from "./editions.json";
import { annualRegistry, releaseInstant } from "../shared/annual-editions.mjs";
// Freeze the available years at build time. A visitor's clock cannot announce one.
const registry = annualRegistry(configuredRegistry, Number(import.meta.env.VITE_EDITION_BUILD_TIME));
import type { EventData } from "./data";
export const editions = registry.editions.filter(e => e.announced);
export const latestYear = registry.latestYear;
export const editionRoot = import.meta.env.BASE_URL.replace(/\d{4}\/$/, "");
export const editionURL = (year: number) => `${editionRoot}${year}/`;
const requestedYear = Number(window.location.pathname.match(/\/(\d{4})(?:\/|$)/)?.[1]);
export const selectedEdition = editions.find(e => e.year === requestedYear) ?? editions.find(e => e.year === latestYear)!;
export function previousEdition(now: number) {
  if (editions.some(e => now >= Date.parse(e.startAt) && now < Date.parse(e.closeAt))) return undefined;
  return editions.filter(e => e.year < latestYear && now >= Date.parse(e.closeAt)).sort((a,b) => b.year-a.year)[0];
}
export function emptyEditionData(): EventData {
  const e = selectedEdition;
  return { version: 1, demo: false, generatedAt: e.startAt, lastSuccessfulSyncAt: null,
    participantsLastSuccessAt: null, participantsFailed: false,
    event: { timezone: "America/Mexico_City", startAt: e.startAt, closeAt: e.closeAt, totalProblems: 62,
      schedule: Array.from({length:31}, (_,i) => {
        const date = `${e.year}-10-${String(i+1).padStart(2,'0')}`;
        return {date, releaseAt: releaseInstant(e.year, 10, i+1)};
      }) }, days: [], participants: [] };
}
