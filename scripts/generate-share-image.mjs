// Run with PLAYWRIGHT_CHANNEL=chrome node scripts/generate-share-image.mjs.
// Uses the bundled Roboto Mono font; no remote assets or private event data.
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const font = await readFile(new URL('../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff2', import.meta.url));
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><style>
    @font-face { font-family: Mono; src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2'); font-weight: 500; }
    * { box-sizing: border-box; } body { margin:0; width:1200px; height:630px; padding:68px 76px; background:#101718; color:#e4efed; font-family:Mono,monospace; font-weight:500; }
    header { display:flex; align-items:center; justify-content:space-between; color:#a7b9b9; font-size:22px; }
    .flame { width:42px; height:48px; filter:drop-shadow(0 0 10px #f4b94250); }
    h1 { font-size:66px; font-weight:500; letter-spacing:-2px; margin:79px 0 30px; white-space:nowrap; }
    .teal { color:#78dfca; } p { margin:0; font-size:29px; line-height:1.65; }
    footer { margin-top:66px; padding-top:26px; border-top:1px solid #344747; display:flex; justify-content:space-between; align-items:center; font-size:19px; color:#a7b9b9; }
  </style></head><body>
    <header><span>OCTOBER 1–31 · 2026</span><svg class="flame" viewBox="0 0 32 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="gold" x2="1" y2="1"><stop stop-color="#ffe6a0"/><stop offset="1" stop-color="#f4b942"/></linearGradient></defs><path fill="url(#gold)" d="M17 2c2 8-5 10-4 16 3-1 5-4 6-7 7 6 11 11 8 17-2 5-7 6-11 6S5 32 4 26C2 17 12 14 10 7c4 2 5 5 5 7 3-4 3-8 2-12Z"/><path fill="#fff0bd" d="M17 20c0 4-5 5-4 9 1 3 6 3 7 0 1-3-1-6-3-9Z"/></svg></header>
    <h1><span class="teal">[</span> Codetober 2026 <span class="teal">]</span></h1>
    <p>Two problems a day.<br><span class="teal">Practice together.</span></p>
    <footer><span>A community programming challenge</span><span class="teal">alegu3rra.github.io/codetober</span></footer>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL('../public/social-card-2026.png', import.meta.url).pathname });
} finally { await browser.close(); }
