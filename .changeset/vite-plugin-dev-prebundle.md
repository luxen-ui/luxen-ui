---
'luxen-ui': patch
---

`luxen.config.mjs` now applies in `vite dev` as it does in `vite build`. With `luxen-ui` installed from npm, the dev server ignored it: elements kept the `l-` prefix while the CSS used the configured one, and a custom `colorScheme.storageKey` or `apply` had no effect. The configuration now also applies, in dev and build alike, when `luxen-ui` is installed under an npm alias (`"my-ui": "npm:luxen-ui@…"`), linked from a workspace, `npm link` or a `file:` dependency, or when a project points Vite at its TypeScript source; all of these used to keep every default. A prefix is now written exactly as configured, whatever characters it holds.
