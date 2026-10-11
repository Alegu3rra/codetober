import React, { useId, useRef, useState } from 'react';
import { AnchoredTooltip } from './AnchoredTooltip';

export function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return <span className="info-tooltip" onMouseEnter={() => setOpen(true)} onMouseLeave={() => { if (document.activeElement !== anchor.current) setOpen(false); }}>
    <button ref={anchor} type="button" className="info-tooltip-trigger" aria-label={`About ${label}`} aria-describedby={id}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <span aria-hidden="true">ⓘ</span>
    </button>
    <AnchoredTooltip id={id} open={open} anchor={anchor} className="info-tooltip-content">{children}</AnchoredTooltip>
  </span>;
}
