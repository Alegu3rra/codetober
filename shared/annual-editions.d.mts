export interface Edition {
  year: number;
  announced: boolean;
  startAt: string;
  closeAt: string;
  registrationCloseAt: string | null;
  registrationUrl: string | null;
  snapshot: string | null;
}
export interface Registry {
  automaticAnnualCycle?: boolean;
  latestYear: number;
  editions: Edition[];
}
export function releaseInstant(year: number, month: number, day?: number): string;
export function annualRegistry(registry: Registry, now?: number): Registry;
