import { configuredZone } from "./config";

export function currentYear(now = new Date()) {
  return Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: configuredZone }).format(now));
}

export function resolveRoute(pathname: string, base = import.meta.env.BASE_URL, year = currentYear()) {
  const editionPath = base.replace(/\/$/, "");
  const root = editionPath.replace(/\/\d{4}$/, "");
  const currentPath = `${root}/${year}/`;
  const path = pathname.replace(/\/$/, "");
  const relative = path.startsWith(`${root}/`) ? path.slice(root.length + 1) : null;
  const requestedYear = relative && /^\d{4}$/.test(relative) ? Number(relative) : null;
  if (path === '' || path === root || path === `${root}/index.html` || (requestedYear !== null && requestedYear > year)) {
    return { kind: "redirect" as const, currentPath };
  }
  if (path === editionPath || path === `${editionPath}/index.html`) {
    return { kind: "edition" as const, currentPath };
  }
  return { kind: "not-found" as const, currentPath, requestedYear };
}
