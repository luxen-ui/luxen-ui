// Render template.html → public/og.png (1200×630 social card).
// One-time setup (Playwright is not a project dep, install ad-hoc):
//   pnpm --package=playwright dlx playwright install chromium
// Then run from the docs package:
//   pnpm --package=playwright dlx node scripts/og/render.mjs
//
// Edit template.html → re-run to regenerate.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'template.html');
const outPath = path.join(__dirname, '..', '..', 'public', 'og.png');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.fonts?.ready);
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log('Wrote', outPath);
