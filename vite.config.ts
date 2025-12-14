import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    categories: {
      correctness: 'warn',
      suspicious: 'warn',
      perf: 'warn',
    },
  },
  fmt: {
    // https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html
    singleQuote: true,
    singleAttributePerLine: true,
    ignorePatterns: ['.agents', '**/dist', '**/cdn', '**/CHANGELOG.md', '**/*.d.ts'],
  },
});
