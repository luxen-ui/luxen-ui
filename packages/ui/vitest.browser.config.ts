import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';
import { designTokens } from './tests/build-design-tokens';

// Custom-element component tests in a real browser. Required for ARIA set via
// ElementInternals, getByRole, :state(), showModal/popover, etc. — none of which
// work under jsdom/happy-dom. Run with: vp test run --config vitest.browser.config.ts
export default defineConfig({
  // Serve test fixture assets (e.g. /emoji.json) from a directory scoped to this
  // config only — never from the package root's public/ which would leak into
  // the CSS/CDN build outputs.
  publicDir: 'tests/fixtures/public',
  // Keeps the design-token CSS the light-DOM skins import built and watched — see
  // the plugin for why a direct `vitest run` would otherwise read a stale build.
  plugins: [designTokens()],
  test: {
    include: ['tests/elements/**/*.test.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
