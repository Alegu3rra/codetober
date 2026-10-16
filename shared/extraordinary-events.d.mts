export interface ExtraordinaryEvent {
  id: string; type: 'backlog-recovery'; title: string;
  startAt: string; endAt: string; problemTimeSeconds: 86400;
}
export function recoveryEventFor(events: ExtraordinaryEvent[] | undefined, now: number): ExtraordinaryEvent | undefined;
export function isRecoveryAcceptance(event: ExtraordinaryEvent | undefined, deadline: number, accepted: number): boolean;
