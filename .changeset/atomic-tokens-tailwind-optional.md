---
'luxen-ui': minor
---

Extract design tokens into a new `@luxen-ui/design-tokens` workspace (vendored from Tailwind v4 oklch palette). Tailwind is now opt-in via a separate bridge preset.

**Breaking changes:**

- `@import 'luxen-ui/css'` → `@import 'luxen-ui/css/preset'`
- `@import 'luxen-ui/tailwind'` → `@import 'luxen-ui/tailwind/preset'`
- `@import 'luxen-ui/css/base'` no longer includes tokens (now just runtime helpers — `.l-visually-hidden`, custom element FOUC fix)

**New atomic CSS imports:**

- `luxen-ui/css/preset` — opinionated default (base + tokens)
- `luxen-ui/css/base` — runtime helpers only
- `luxen-ui/css/tokens` — primitives + aliases combined
- `luxen-ui/css/tokens/primitives` — palette + spacing + radius + text + …
- `luxen-ui/css/tokens/aliases` — semantic tokens (text-primary, bg-fill-brand, …)
- `luxen-ui/css/tokens/palette` — extended 21 Tailwind palette families
- `luxen-ui/tailwind/preset` — opt-in Tailwind v4 bridge

**New CLI:** `npx luxen-ui import {preset,tailwind,design-tokens}` copies any preset for customization.
