---
'luxen-ui': minor
---

New `npx luxen-ui generate-skill` CLI subcommand that produces a brand-aware Agent Skill folder for your project — uses your prefix, your brand tokens, your design system name. The skill is fully self-contained: a single `<name>-standalone.{js,css}` pair under `assets/` loads every element in a mockup HTML with one `<link>` and one `<script>` — no CDN dependency.

Both the CLI and the Vite plugin now read a shared `luxen.config.mjs` at the project root (`elementPrefix`, `cssPrefix`, `emitTypes`, `themeCss`, …) — one source of truth for dev/build and skill generation. The Vite plugin also rewrites the runtime registry initialisers at build time, so `setPrefix()` is no longer needed in consumer entry points (still exported for advanced cases).

Also:

- `defineConfig` helper + `LuxenConfig` / `LuxenEmitTypesConfig` types exported from `luxen-ui/config` for editor autocompletion in `luxen.config.mjs` without TypeScript.
- Standalone CDN bundle (`cdn/standalone.js` + `cdn/standalone.css`) shipped alongside the existing code-split `cdn/` tree (public jsDelivr consumers unchanged).

`packages/ui/dist/skills/` is no longer produced; every consumer generates their own via the CLI.
