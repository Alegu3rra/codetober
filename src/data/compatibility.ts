// Normalize historical field names before validating the public contract.
export function normalizeSnapshot(input: unknown) {
  if (!input || typeof input !== 'object') return input;
  const data = input as Record<string, unknown>;
  return {
    ...data,
    participantsLastSuccessAt: Object.hasOwn(data, 'participantsLastSuccessAt') ? data.participantsLastSuccessAt : data.sheetsLastSuccessAt,
    participantsFailed: Object.hasOwn(data, 'participantsFailed') ? data.participantsFailed : data.sheetsFailed,
  };
}
