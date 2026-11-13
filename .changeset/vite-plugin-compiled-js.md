---
'luxen-ui': patch
---

`luxen-ui/vite-plugin` now loads in a plain Vite or TanStack Start project. It shipped as TypeScript source, which Node refuses to run from `node_modules`, so `vite build` stopped with `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` and a custom prefix in `luxen.config.js` could not be applied. The plugin now ships as JavaScript with its own type declarations, typed against `vite` instead of `vite-plus`, so type-checking a `vite.config.ts` that uses it no longer fails either.
