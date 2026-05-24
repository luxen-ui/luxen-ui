import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  test: {
    include: ['**/tests/**/*.test.ts'],
    exclude: ['**/browser/**', '**/node_modules/**', '**/dist/**', '**/cdn/**'],
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
    rules: {
      'typescript/no-unsafe-type-assertion': 'off',
      'typescript/no-unnecessary-type-parameters': 'off',
      'typescript/consistent-return': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
    overrides: [
      {
        files: ['packages/ui/scripts/**/*.mjs'],
        rules: {
          'typescript/no-implied-eval': 'off',
        },
      },
    ],
  },
  fmt: {
    // https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html
    singleQuote: true,
    singleAttributePerLine: true,
    ignorePatterns: ['.agents', '**/dist', '**/cdn', '**/CHANGELOG.md', '**/*.d.ts'],
  },
});
