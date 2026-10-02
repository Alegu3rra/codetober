import React from "react";

function displayTime(value: string | null, zone: string, seconds = false) {
  if (!value) return "Not yet synced";
  try {
    return new Intl.DateTimeFormat("en", {
      timeZone: zone,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" as const } : {}),
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function Timestamp({ value, zone, seconds = false }: { value: string | null; zone: string; seconds?: boolean }) {
  return value ? (
    <time dateTime={value}>{displayTime(value, zone, seconds)}</time>
  ) : (
    <>Not yet synced</>
  );
}
