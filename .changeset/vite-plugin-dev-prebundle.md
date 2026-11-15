---
'luxen-ui': patch
---

`luxen.config.mjs` now applies in `vite dev`, not only in `vite build`. When `luxen-ui` is installed from npm, Vite pre-bundles it for dev and skips plugins' `transform` step, so dev served the defaults: elements were defined as `l-*` under a renamed `elementPrefix` while the CSS was renamed, and a custom `colorScheme.storageKey` or `apply` was ignored. The Vite plugin now bakes the same values while Vite pre-bundles, on Vite 5 through 8, and the dev cache is rebuilt when `luxen.config.mjs` changes, after a restart. The configuration also applies, in dev and build alike, to a `luxen-ui` installed under an npm alias (`"my-ui": "npm:luxen-ui@…"`) or linked from a workspace, `npm link` or a `file:` dependency, which kept every default. Each value is written exactly as configured, whatever characters it holds.
