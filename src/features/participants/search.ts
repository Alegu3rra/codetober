import type { Participant } from "../../data/schema";

export function filterParticipants(participants: Participant[], query: string) {
  const value = query.trim().toLocaleLowerCase('en');
  return participants.filter(p => `${p.display_name}\n${p.leetcode_username}`.toLocaleLowerCase('en').includes(value));
}
