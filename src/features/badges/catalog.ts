import type { ParticipantBadge } from './schema';

const topics: Record<string, { name: string; icon: string; description: string }> = {
  dp: { name: 'DP Champion', icon: '🧠', description: 'dynamic programming: states, recurrences, and reusing results' },
  graphs: { name: 'Graph Explorer', icon: '🕸️', description: 'graphs: connections, traversals, dependencies, and paths' },
  'binary-search': { name: 'Divide and Find', icon: '🎯', description: 'binary search and narrowing the search space' },
  'two-pointers': { name: 'Two-Pointer Pro', icon: '👉👈', description: 'two pointers that traverse and compare positions' },
  'sliding-window': { name: 'Window Watcher', icon: '🪟', description: 'sliding windows over contiguous segments' },
  stacks: { name: 'Full Stack', icon: '🥞', description: 'stacks and processing elements in reverse order' },
  hashing: { name: 'Hash Keeper', icon: '🗂️', description: 'maps and sets to find, count, and group values' },
  'prefix-sums': { name: 'Sum It Up', icon: '➕', description: 'prefix sums and cumulative totals for range queries' },
  backtracking: { name: 'Backtrack Explorer', icon: '🧭', description: 'backtracking: exploring possibilities and stepping back to try others' },
  math: { name: 'Math Mind', icon: '🔢', description: 'prime numbers, counting, and mathematical properties' },
};
const achievements: Record<string, { name: string; icon: string; tooltip: (e: ParticipantBadge['evidence']) => string }> = {
  'codetober-finisher': { name:'Codetober Finisher',icon:'🏁',tooltip:e=>`Completed all ${e.solved}/${e.total} problems with valid acceptances before closure. On-time and late solves both count. Verified corrections may update this recognition.` },
  'past-halfway': { name:'Past Halfway',icon:'🌗',tooltip:e=>`Completed ${e.solved}/${e.total} problems before closure: more than 50% of the edition. Exactly half does not qualify. This tag does not change ranking.` },
  'took-part': { name:'Took Part',icon:'🌱',tooltip:e=>`Completed ${e.solved}/${e.total} problems before closure. Every recorded solve is part of your practice history. This tag does not change ranking.` },
  'on-fire': { name: 'On Fire', icon: '🔥', tooltip: e => `Recorded at least one on-time Accepted submission for ${e.days} consecutive days.` },
  'golden-week': { name: 'Golden Week', icon: '🏅', tooltip: e => `Completed both daily problems on time for ${e.days} consecutive days. This achievement is retained throughout the edition.` },
  'hard-hunter': { name: 'Hard Hunter', icon: '💀', tooltip: e => `Recorded Accepted submissions for ${e.solved} distinct Hard problems in this edition.` },
  'all-rounder': { name: 'All-Rounder', icon: '🌈', tooltip: e => `Recorded Accepted submissions for at least 2 problems in each of ${e.topics} different topics.` },
  'knowledge-sharer': { name: 'Knowledge Sharer', icon: '✍️', tooltip: e => `Published ${e.contributions} reviewed editorial${e.contributions === 1 ? '' : 's'} to share solutions with the community.` },
  'community-voice': { name: 'Community Voice', icon: '📚', tooltip: e => `Published ${e.contributions} reviewed editorials in this edition.` },
  comeback: { name: 'Back in the Challenge', icon: '🔄', tooltip: () => 'Recorded an on-time Accepted submission after a full challenge day with no on-time Accepted submissions recorded.' },
  'accepted-burst': { name: 'Accepted in Bursts', icon: '⚡', tooltip: e => `On ${e.qualifyingDays} of the last ${e.windowDays} eligible completed challenge days, recorded both Accepted submissions within ${e.maxGapSeconds / 60} minutes of each other. Each day includes two Medium or Hard problems, with at least one Hard. This interval does not measure solving time or prove AI use.` },
  'extra-time': { name: 'Extra Time', icon: '✨', tooltip: e => `After completing both daily problems on time, recorded Accepted submissions for ${e.extraProblems} additional problem${e.extraProblems === 1 ? '' : 's'} before 06:00 the next day, Mexico City time. Recognizes observed activity; older Accepted submissions may be missing from the query results.` },
  'extra-mile': { name: 'One More Problem', icon: '🚀', tooltip: e => `On ${e.qualifyingDays} of the last ${e.windowDays} completed challenge days, recorded Accepted submissions for at least ${e.extraProblems} distinct problems outside the calendar after completing the daily challenge on time. The challenge day ends at 06:00, Mexico City time. Recognizes observed activity; older Accepted submissions may be missing from the query results.` },
};

export function badgePresentation(badge: ParticipantBadge) {
  for (const prefix of ['topic-', 'collection-', 'explains-']) {
    if (!badge.id.startsWith(prefix)) continue;
    const topic = topics[badge.id.slice(prefix.length)];
    if (!topic) return null;
    if (prefix === 'collection-') return { name: `Complete Collection · ${topic.name}`, icon: '🏆',
      tooltip: `By the end of the edition, completed all ${badge.evidence.total} problems associated with ${topic.description}.` };
    if (prefix === 'explains-') return { name: `Explains the Topic · ${topic.name}`, icon: '💡',
      tooltip: `Published ${badge.evidence.contributions} editorial${badge.evidence.contributions === 1 ? '' : 's'} with an explicit review confirming a technique related to ${topic.description}.` };
    return { ...topic, tooltip: `${badge.level === 2 ? 'Strong Topic' : 'In Practice'} · ${badge.evidence.solved} distinct accepted problems associated with ${topic.description}. In Practice requires 2; Strong Topic requires 3, including at least one Medium or Hard. Describes the problem topic, not the technique used.` };
  }
  const item = achievements[badge.id];
  return item ? { name: item.name, icon: item.icon, tooltip: item.tooltip(badge.evidence) } : null;
}

export function featuredBadges(badges: ParticipantBadge[]) {
  const known = badges.filter(b => badgePresentation(b));
  const topic = known.filter(b => b.category === 'topic').sort((a, b) => (b.level ?? 0) - (a.level ?? 0)
    || (b.evidence.solved ?? 0) - (a.evidence.solved ?? 0) || a.id.localeCompare(b.id))[0];
  const consistency = known.find(b => b.id === 'golden-week') ?? known.find(b => b.category === 'consistency');
  const priority = ['extra-mile', 'community-voice', 'hard-hunter', 'all-rounder', 'knowledge-sharer', 'extra-time', 'comeback', 'accepted-burst'];
  const achievement = priority.map(id => known.find(b => b.id === id)).find(Boolean)
    ?? known.find(b => b.id.startsWith('collection-') || b.id.startsWith('explains-'));
  const completion = ['codetober-finisher','past-halfway','took-part'].map(id=>known.find(b=>b.id===id)).find(Boolean);
  return [completion, topic, consistency, achievement].filter((b): b is ParticipantBadge => !!b).slice(0,3);
}
