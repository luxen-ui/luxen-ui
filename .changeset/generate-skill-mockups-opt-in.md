---
'luxen-ui': patch
---

`npx luxen-ui generate-skill` now produces an **integration-only** skill by default. The standalone bundle (`assets/<name>-standalone.{js,css}`, ~1.7 MB), `assets/claude-design.md`, `references/mockups.md`, and the "Mode 2" section of `SKILL.md` — used only for Claude Design and single-page HTML mockups — are no longer emitted unless you ask for them.

Pass `--with-mockups` (or set `mockups: true` in `luxen.config.mjs`) to include them. If you generate the skill for Claude Design, add the flag: `npx luxen-ui generate-skill --with-mockups`. The `themeCss` option only applies in this mode and is ignored (with a warning) otherwise.
