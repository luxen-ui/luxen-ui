import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

// Custom-element component tests in a real browser. Required for ARIA set via
// ElementInternals, getByRole, :state(), showModal/popover, etc. — none of which
// work under jsdom/happy-dom. Run with: vp test run --config vitest.browser.config.ts
export default defineConfig({
  // Serve test fixture assets (e.g. /emoji.json) from a directory scoped to this
  // config only — never from the package root's public/ which would leak into
  // the CSS/CDN build outputs.
  publicDir: 'tests/fixtures/public',
  test: {
    include: ['tests/elements/**/*.test.ts'],
    // Rebuilds the design-token CSS the light-DOM skins import — see the file
    // for why a direct `vitest run` would otherwise read a stale build.
    globalSetup: ['tests/build-design-tokens.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
