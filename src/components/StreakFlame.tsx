import React, { useId } from "react";

export function StreakFlame({ value, goldRatio, label }: {
  value: number; goldRatio: number; label: string;
}) {
  const id = useId();
  const ratio = Math.max(0, Math.min(1, goldRatio));
  const split = 100 * (1 - ratio);
  return (
    <span className={`streak-flame ${value ? "is-active" : ""} ${value && ratio > 0 ? "is-golden" : ""}`}
      style={{ "--glow-strength": ratio } as React.CSSProperties}
      role="img" aria-label={label} title={label} tabIndex={0}>
      <svg viewBox="0 0 32 36" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset={`${Math.max(0, split - 3)}%`} stopColor={ratio === 1 ? "#f4b942" : "#78dfca"} />
            <stop offset={`${Math.min(100, split + 3)}%`} stopColor={ratio === 0 ? "#78dfca" : "#ffd978"} />
            <stop offset="100%" stopColor={ratio === 0 ? "#78dfca" : "#f4b942"} />
          </linearGradient>
        </defs>
        <path fill={value ? `url(#${id})` : "none"} stroke={value ? `url(#${id})` : "currentColor"} strokeWidth="2" strokeLinejoin="round"
          d="M17 2c2 8-5 10-4 16 3-1 5-4 6-7 7 6 11 11 8 17-2 5-7 6-11 6S5 32 4 26C2 17 12 14 10 7c4 2 5 5 5 7 3-4 3-8 2-12Z" />
        {value > 0 && ratio > 0 && <path fill="#fff0bd" opacity={0.65 * ratio}
          d="M17 20c0 4-5 5-4 9 1 3 6 3 7 0 1-3-1-6-3-9Z" />}
      </svg>
      <span aria-hidden="true">{value}</span>
      <span className="flame-tooltip" aria-hidden="true">{label}</span>
    </span>
  );
}
