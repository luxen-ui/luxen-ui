// Local type shim for `vite-plus/test`.
//
// `vite-plus/test` is `export * from 'vitest'`. typescript-go (tsgolint, the
// engine behind `vp check`) currently fails to follow that cross-package star
// re-export, so every `import { it, expect, … } from 'vite-plus/test'` reports
// TS2305 "no exported member". Plain `tsc` resolves it fine, and so does a
// direct `import … from 'vitest'`. We redirect the type resolution (only — vite
// still loads the real module at runtime) through explicit named re-exports,
// which tsgolint does follow. Drop this once tsgolint resolves the star barrel.
export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';
