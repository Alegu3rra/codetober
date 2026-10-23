import React, { useEffect, useRef } from 'react';

export function FairyDust({ enabled, target }: { enabled: boolean; target: React.RefObject<HTMLElement | null> }) {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const element = target.current;
    if (!enabled || !element) return;
    let last = 0;
    const move = (e: PointerEvent) => {
      if (media.matches || e.pointerType !== 'mouse' || performance.now() - last < 45 || !layer.current) return;
      last = performance.now();
      if (layer.current.childElementCount >= 18) layer.current.firstElementChild?.remove();
      const spark = document.createElement('span');
      spark.className = 'fairy-spark'; spark.textContent = '✦';
      spark.style.left = `${e.clientX}px`; spark.style.top = `${e.clientY}px`;
      spark.style.setProperty('--drift', `${Math.random() * 24 - 12}px`);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
      layer.current.append(spark);
    };
    element.addEventListener('pointermove', move);
    return () => { element.removeEventListener('pointermove', move); layer.current?.replaceChildren(); };
  }, [enabled, target]);
  return <div ref={layer} className="fairy-dust" aria-hidden="true" />;
}
