// `vitest` is injected by the Vite+ test runner at runtime and is not a
// resolvable package on disk, so the lint type-checker can't find its types.
// This ambient stub keeps `import … from 'vitest'` lint-clean in test files.
declare module 'vitest';
