import type { ParticipantBadge } from './schema';

const topics: Record<string, { name: string; icon: string; description: string }> = {
  dp: { name: 'Memoria de campeón', icon: '🧠', description: 'programación dinámica: estados, recurrencias y reutilización de resultados' },
  graphs: { name: 'Explorador de grafos', icon: '🕸️', description: 'grafos: conexiones, recorridos, dependencias y caminos' },
  'binary-search': { name: 'Divide y encuentra', icon: '🎯', description: 'búsqueda binaria y reducción del espacio de búsqueda' },
  'two-pointers': { name: 'Doble precisión', icon: '👉👈', description: 'dos punteros que recorren y comparan posiciones' },
  'sliding-window': { name: 'Ventana con vista', icon: '🪟', description: 'ventanas deslizantes sobre segmentos contiguos' },
  stacks: { name: 'Full stack', icon: '🥞', description: 'pilas y procesamiento de elementos en orden inverso' },
  hashing: { name: 'Todo bajo llave', icon: '🗂️', description: 'mapas y conjuntos para buscar, contar y agrupar valores' },
  'prefix-sums': { name: 'Suma y sigue', icon: '➕', description: 'acumulados y sumas prefijas para consultar rangos' },
  backtracking: { name: 'Explora y regresa', icon: '🧭', description: 'backtracking: explorar posibilidades y retroceder para probar otras' },
  math: { name: 'Mente matemática', icon: '🔢', description: 'números primos, conteo y propiedades matemáticas' },
};
const achievements: Record<string, { name: string; icon: string; tooltip: (e: ParticipantBadge['evidence']) => string }> = {
  'on-fire': { name: 'En racha', icon: '🔥', tooltip: e => `Consiguió al menos un Accepted a tiempo durante ${e.days} días consecutivos.` },
  'golden-week': { name: 'Semana dorada', icon: '🏅', tooltip: e => `Completó ambos problemas a tiempo durante ${e.days} días consecutivos. Este logro se conserva durante la edición.` },
  'hard-hunter': { name: 'Cazador de Hard', icon: '💀', tooltip: e => `Consiguió aceptados en ${e.solved} problemas Hard distintos de esta edición.` },
  'all-rounder': { name: 'Todoterreno', icon: '🌈', tooltip: e => `Consiguió aceptados en al menos 2 problemas de cada uno de ${e.topics} temas distintos.` },
  'knowledge-sharer': { name: 'Comparte el conocimiento', icon: '✍️', tooltip: e => `Publicó ${e.contributions} editorial${e.contributions === 1 ? '' : 'es'} revisada${e.contributions === 1 ? '' : 's'} para compartir su solución con la comunidad.` },
  'community-voice': { name: 'Voz de la comunidad', icon: '📚', tooltip: e => `Publicó ${e.contributions} editoriales revisadas en esta edición.` },
  comeback: { name: 'De vuelta al reto', icon: '🔄', tooltip: () => 'Volvió a conseguir un Accepted a tiempo después de una jornada completa sin aceptados a tiempo registrados.' },
  'accepted-burst': { name: 'Aceptados en ráfaga', icon: '⚡', tooltip: e => `En ${e.qualifyingDays} de las últimas ${e.windowDays} jornadas elegibles cerradas, registró ambos aceptados con una separación de ${e.maxGapSeconds / 60} minutos o menos. Cada jornada tiene dos Medium o Hard y al menos un Hard. Este intervalo no mide el tiempo de resolución ni demuestra uso de IA.` },
  'extra-time': { name: 'Tiempo extra', icon: '✨', tooltip: e => `Después de completar ambos problemas del día a tiempo, registró aceptados en ${e.extraProblems} problema${e.extraProblems === 1 ? '' : 's'} adicional${e.extraProblems === 1 ? '' : 'es'} antes de las 06:00 del día siguiente, hora de Ciudad de México. Reconoce actividad observada; la consulta puede omitir aceptados antiguos.` },
  'extra-mile': { name: 'Una más y me voy', icon: '🚀', tooltip: e => `En ${e.qualifyingDays} de las últimas ${e.windowDays} jornadas cerradas, registró aceptados en al menos ${e.extraProblems} problemas distintos fuera del calendario después de completar el reto del día a tiempo. La jornada termina a las 06:00, hora de Ciudad de México. Reconoce actividad observada; la consulta puede omitir aceptados antiguos.` },
};

export function badgePresentation(badge: ParticipantBadge) {
  for (const prefix of ['topic-', 'collection-', 'explains-']) {
    if (!badge.id.startsWith(prefix)) continue;
    const topic = topics[badge.id.slice(prefix.length)];
    if (!topic) return null;
    if (prefix === 'collection-') return { name: `Colección completa · ${topic.name}`, icon: '🏆',
      tooltip: `Al finalizar la edición, completó los ${badge.evidence.total} problemas asociados con ${topic.description}.` };
    if (prefix === 'explains-') return { name: `Explica el tema · ${topic.name}`, icon: '💡',
      tooltip: `Publicó ${badge.evidence.contributions} editorial${badge.evidence.contributions === 1 ? '' : 'es'} con una revisión explícita que confirma una técnica de ${topic.description}.` };
    return { ...topic, tooltip: `${badge.level === 2 ? 'Tema fuerte' : 'En práctica'} · ${badge.evidence.solved} problemas distintos aceptados asociados con ${topic.description}. En práctica requiere 2; tema fuerte requiere 3 y al menos un Medium o Hard. Describe el tema del problema, no la técnica utilizada.` };
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
  return [topic, consistency, achievement].filter((b): b is ParticipantBadge => !!b);
}
