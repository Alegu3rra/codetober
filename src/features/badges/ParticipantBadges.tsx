import { useId, useState } from 'react';
import { badgePresentation, featuredBadges } from './catalog';
import type { ParticipantBadge } from './schema';

function Badge({ badge }: { badge: ParticipantBadge }) {
  const presentation = badgePresentation(badge);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 24, bottom: 24 });
  const show = (target: HTMLElement) => {
    const bounds = target.getBoundingClientRect();
    setPosition(window.innerWidth <= 600 ? { left: 24, bottom: 24 } : {
      left: Math.max(24, Math.min(bounds.left, window.innerWidth - 324)),
      bottom: bounds.top >= 280 ? Math.max(24, window.innerHeight - bounds.top + 8) : 24,
    });
    setOpen(true);
  };
  if (!presentation) return null;
  return <span className="participant-badge" onMouseEnter={event => show(event.currentTarget)} onMouseLeave={() => setOpen(false)}>
    <button type="button" className={`badge-pill badge-${badge.category}`} aria-describedby={open ? id : undefined}
      onFocus={event => show(event.currentTarget)} onBlur={() => setOpen(false)} onClick={event => show(event.currentTarget)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <span aria-hidden="true">{presentation.icon}</span> {presentation.name}
      {badge.category === 'topic' && <span className="badge-count">{badge.evidence.solved}</span>}
    </button>
    <span role="tooltip" id={id} className="badge-tooltip" style={{ ...position, maxHeight: `calc(100vh - ${position.bottom + 24}px)` }} hidden={!open}>{presentation.tooltip}</span>
  </span>;
}

export function ParticipantBadges({ badges = [], compact = false }: { badges?: ParticipantBadge[]; compact?: boolean }) {
  const visible = (compact ? featuredBadges(badges) : badges).filter(b => badgePresentation(b));
  if (!visible.length) return null;
  return <div className={`participant-badges${compact ? ' compact-badges' : ''}`} aria-label={compact ? 'Featured participant tags' : 'All participant tags'}>
    {visible.map(badge => <Badge key={badge.id} badge={badge} />)}
  </div>;
}
