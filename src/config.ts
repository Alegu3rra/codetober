import { selectedEdition } from "./editions";

export const eventName = `Codetober ${selectedEdition.year}`;
export const configuredZone = import.meta.env.VITE_EVENT_TIMEZONE || "America/Mexico_City";
