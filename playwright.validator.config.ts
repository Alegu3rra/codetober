import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./validator-tests',reporter:'list',
  use:{baseURL:'http://127.0.0.1:5175',browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL,screenshot:'only-on-failure'},
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',url:'http://127.0.0.1:5175/codetober/2026/',reuseExistingServer:!process.env.CI},
  projects:[{name:'desktop',use:{viewport:{width:1366,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
});
