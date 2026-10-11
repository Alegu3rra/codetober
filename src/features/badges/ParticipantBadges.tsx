import { useId, useRef, useState } from 'react';
import { AnchoredTooltip } from '../../components/AnchoredTooltip';
import { badgePresentation, featuredBadges } from './catalog';
import type { ParticipantBadge } from './schema';

function Badge({ badge }: { badge: ParticipantBadge }) {
  const presentation = badgePresentation(badge);
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  if (!presentation) return null;
  return <span className="participant-badge" onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (document.activeElement !== anchor.current) setOpen(false); }}>
    <button ref={anchor} type="button" className={`badge-pill badge-${badge.category}`} aria-describedby={open ? id : undefined}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <span aria-hidden="true">{presentation.icon}</span> {presentation.name}
      {badge.category === 'topic' && <span className="badge-count">{badge.evidence.solved}</span>}
    </button>
    <AnchoredTooltip id={id} open={open} anchor={anchor} className="badge-tooltip">{presentation.tooltip}</AnchoredTooltip>
  </span>;
}

export function ParticipantBadges({ badges = [], compact = false }: { badges?: ParticipantBadge[]; compact?: boolean }) {
  const visible = (compact ? featuredBadges(badges) : badges).filter(b => badgePresentation(b));
  if (!visible.length) return null;
  return <div className={`participant-badges${compact ? ' compact-badges' : ''}`} aria-label={compact ? 'Featured participant tags' : 'All participant tags'}>
    {visible.map(badge => <Badge key={badge.id} badge={badge} />)}
  </div>;
}
