import React from "react";

function displayTime(value: string | null, zone: string) {
  if (!value) return "Not yet synced";
  try {
    return new Intl.DateTimeFormat("en", {
      timeZone: zone,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function Timestamp({ value, zone }: { value: string | null; zone: string }) {
  return value ? (
    <time dateTime={value}>{displayTime(value, zone)}</time>
  ) : (
    <>Not yet synced</>
  );
}
