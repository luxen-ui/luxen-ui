import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/browser/**', '**/node_modules/**'],
  },
});
