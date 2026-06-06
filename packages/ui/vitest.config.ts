import { defineConfig } from 'vite-plus';

// Node unit tests (CLI, PostCSS) — no DOM. Component tests that need a real
// browser live in tests/elements/ and run via vitest.browser.config.ts.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/elements/**', '**/browser/**', '**/node_modules/**'],
  },
});
