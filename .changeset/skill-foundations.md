---
'luxen-ui': minor
---

`npx luxen-ui generate-skill` now ships the Foundations guides, starting with focus, as `references/foundations/<name>.md`, with your prefix applied. `SKILL.md` tells the agent to read the focus guide before it styles a focus state, overrides a focus token or puts controls on a custom background. The guide covers where each ring is drawn, contrast, forced colors, theming recipes and accessibility rules, and lists the focus tokens with their defaults.

Links to the documentation site inside the generated references are now absolute URLs, so they work outside the site.
