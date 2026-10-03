const timezone = 'America/Mexico_City';
// Resolve 06:00 Guadalajara through IANA rules instead of the host timezone.
export function releaseInstant(year, month, day = 1) {
  const target = Date.UTC(year, month - 1, day, 6);
  let instant = target;
  const format = new Intl.DateTimeFormat('en-CA', {timeZone: timezone,
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
  for (let i = 0; i < 4; i++) {
    const p = Object.fromEntries(format.formatToParts(instant).map(p => [p.type, p.value]));
    const shown = Date.UTC(+p.year, +p.month-1, +p.day, +p.hour, +p.minute, +p.second);
    const adjustment = target - shown;
    if (!adjustment) return new Date(instant).toISOString();
    instant += adjustment;
  }
  throw new Error('Could not resolve annual release time');
}
export function annualRegistry(registry, now = Date.now()) {
  if (!registry.automaticAnnualCycle) return registry;
  if (!Number.isFinite(now)) throw new Error('Invalid build date');
  const firstYear = 2026;
  const calendarYear = Number(new Intl.DateTimeFormat('en', {timeZone:timezone, year:'numeric'}).format(now));
  const latestYear = Math.max(firstYear, calendarYear + (now >= Date.parse(releaseInstant(calendarYear, 11)) ? 1 : 0));
  const editions = [];
  for (let year = firstYear; year <= latestYear; year++) {
    const configured = registry.editions.find(e => e.year === year);
    editions.push({
      year, announced: true, startAt: releaseInstant(year, 10), closeAt: releaseInstant(year, 11),
      registrationCloseAt: configured?.registrationCloseAt ?? null,
      registrationUrl: configured?.registrationUrl ?? null,
      snapshot: configured?.snapshot ?? null,
    });
  }
  return {...registry, latestYear, editions};
}
