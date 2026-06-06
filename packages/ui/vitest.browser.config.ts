import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

// Custom-element component tests in a real browser. Required for ARIA set via
// ElementInternals, getByRole, :state(), showModal/popover, etc. — none of which
// work under jsdom/happy-dom. Run with: vp test run --config vitest.browser.config.ts
export default defineConfig({
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
