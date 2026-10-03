// Node-only helper: a Pages build supplies one timestamp to every Vite process.
export const buildTime = process.env.CODETOBER_BUILD_TIME || String(Date.now());
