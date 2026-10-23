import React from 'react';

export function WishArt({ motif }: { motif: string }) {
  return <svg className={`wish-art wish-art-${motif}`} viewBox="0 0 240 140" fill="none" aria-hidden="true">
    <circle cx="120" cy="70" r="52" className="wish-orbit" />
    <circle cx="120" cy="70" r="65" className="wish-orbit wish-orbit-outer" />
    {motif === 'book' ? <g className="wish-drawing"><path d="M120 45Q92 28 66 43v58q27-15 54 2 27-17 54-2V43q-26-15-54 2Z M120 45v58 M79 56q14-5 28 2 M79 70q14-5 28 2 M133 58q14-7 28-2 M133 72q14-7 28-2" /></g>
      : motif === 'path' ? <g className="wish-drawing"><path d="M56 98Q80 24 120 70t64-28" strokeDasharray="5 7" />{[[56,98],[120,70],[184,42]].map(([x,y], i) => <g key={x}><circle cx={x} cy={y} r="15" fill="#192022" /><text x={x} y={y+5} textAnchor="middle">{i+1}</text></g>)}</g>
      : motif === 'orbit' ? <g className="wish-drawing"><path d="M153 46a42 42 0 1 0 5 43 M153 25v24h-24" /><path d="m115 50 5 13 14 1-11 9 3 14-12-8-12 8 4-14-11-9 14-1Z" /></g>
      : <g className="wish-drawing"><path d="m120 27 11 28 30 3-23 20 7 30-25-16-25 16 7-30-23-20 30-3Z" />{motif === 'stars' && <path d="m62 38 3 8 9 1-7 6 2 9-7-5-8 5 2-9-7-6 10-1Z M177 88v18 M168 97h18" />}</g>}
    <g className="wish-sparkles" transform={motif === 'path' ? 'translate(12 -10)' : undefined}><path d="M186 26v12 M180 32h12 M43 76v10 M38 81h10 M165 117v8 M161 121h8" /><circle cx="80" cy="20" r="2" /><circle cx="204" cy="72" r="2" /></g>
  </svg>;
}
