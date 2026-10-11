import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

// Render outside cards so ancestor transforms and clipping cannot change the viewport coordinates.
export function AnchoredTooltip({ id, open, anchor, className, children }: {
  id: string; open: boolean; anchor: RefObject<HTMLElement | null>; className: string; children: ReactNode;
}) {
  const tooltip = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!anchor.current || !tooltip.current) return;
      const margin = 12, gap = 8;
      const bounds = anchor.current.getBoundingClientRect();
      const element = tooltip.current;
      const width = element.getBoundingClientRect().width;
      const height = element.scrollHeight + element.offsetHeight - element.clientHeight;
      const above = Math.max(0, bounds.top - margin - gap);
      const below = Math.max(0, window.innerHeight - bounds.bottom - margin - gap);
      const useAbove = above >= height || above > below;
      const available = useAbove ? above : below;
      const visibleHeight = Math.min(height, available);
      setPosition({
        left: Math.max(margin, Math.min(bounds.left + bounds.width / 2 - width / 2, window.innerWidth - width - margin)),
        top: useAbove ? bounds.top - gap - visibleHeight : bounds.bottom + gap,
        maxHeight: available,
        visibility: bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth ? 'visible' : 'hidden',
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchor, children]);

  return createPortal(<aside aria-label="Additional information" hidden={!open}><span ref={tooltip} id={id} role="tooltip" hidden={!open} className={`anchored-tooltip ${className}`} style={position}>
    {children}
  </span></aside>, document.body);
}
