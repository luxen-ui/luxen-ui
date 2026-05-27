---
'luxen-ui': patch
---

Fix TypeScript errors in `luxen-ui/vite-plugin` surfaced by strict consumers (e.g. Nuxt 4 with `noUncheckedIndexedAccess`). Adds a `.d.ts` for the bundled PostCSS plugin so `vite-plugin.ts` type-checks cleanly in strict projects. No public API change.
