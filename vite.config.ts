import { buildTime } from './scripts/build-clock.mjs';
import { defineConfig } from 'vitest/config';
import type { Plugin, Connect } from 'vite';

// Mirror Pages' root 404 fallback for year URLs outside the active Vite base.
function editionFallback(): Plugin {
  let base: string;
  const middleware: Connect.NextHandleFunction = (incoming, _response, next) => {
    const request = incoming as typeof incoming & { url?: string; headers: { accept?: string } };
    const path = request.url?.split('?')[0] ?? '';
    const root = base.replace(/\d{4}\/$/, '');
    if (request.headers.accept?.includes('text/html') &&
        (path === '/' || path === root.slice(0, -1) || path.startsWith(root)) &&
        !path.startsWith(base)) {
      request.url = `${base}index.html`;
    }
    next();
  };
  return {
    name: 'edition-fallback',
    configResolved(config) { base = config.base; },
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

export default defineConfig({
  base: '/codetober/2026/',
  define: { 'import.meta.env.VITE_EDITION_BUILD_TIME': JSON.stringify(buildTime) },
  plugins: [editionFallback()],
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts', include: ['src/**/*.test.{ts,tsx}'] },
});
