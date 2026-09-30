import React from "react";

export function Countdown({ target, now }: { target: string; now: number }) {
  const seconds = Math.max(0, Math.ceil((Date.parse(target) - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return (
    <span className="countdown">
      {days ? `${days}d ` : ""}
      {hours}:{minutes}:{remaining}
    </span>
  );
}
