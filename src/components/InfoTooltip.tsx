import React, { useId, useState } from 'react';

export function InfoTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return <span className="info-tooltip" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button type="button" className="info-tooltip-trigger" aria-label={`About ${label}`} aria-describedby={id}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <span aria-hidden="true">ⓘ</span>
    </button>
    <span id={id} role="tooltip" className="info-tooltip-content" hidden={!open}>{children}</span>
  </span>;
}
