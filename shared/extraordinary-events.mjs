// Dates and edition membership come from configuration, never from the regular contest rules.
export function isRecoveryAcceptance(event, deadline, accepted) {
  return event?.type === 'backlog-recovery' && deadline <= Date.parse(event.startAt)
    && accepted >= Date.parse(event.startAt) && accepted < Date.parse(event.endAt);
}

export function recoveryEventFor(events = [], now) {
  const recovery = events.filter(event => event.type === 'backlog-recovery')
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  return recovery.find(event => now < Date.parse(event.endAt)) ?? recovery.at(-1);
}
