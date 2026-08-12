---
'luxen-ui': minor
---

Add `<l-color-scheme-icon>` and `luxen-ui/color-scheme` — a light/dark story split between a glyph and a state model, with no control of its own.

`colorScheme` holds the page's light/dark value and the rules that govern it, following Lea Verou's _Dark mode toggles should be a two-state switch_: an override is stored **only when it differs from the OS**, choosing the scheme the OS already reports releases it instead, and the stored value is read **only when the user acts** — so an OS change never revokes an explicit choice, and "follow the system" stays reachable without a third position. It exposes `current`, `overridden`, `set()`, `toggle()` and `subscribe()`, persists to `localStorage`, syncs across tabs, falls back to memory when storage is refused, and can write `color-scheme` on `<html>` for you. It is a module rather than an element because a document has one scheme and often several controls for it.

Its defaults — the storage key, and whether it applies the scheme itself — can be set in `luxen.config.mjs` under `colorScheme`, baked in at build time by `luxen-ui/vite-plugin` exactly as a renamed prefix is. `configure()` remains for what the build cannot know.

`<l-color-scheme-icon>` is the sun that morphs into that moon: one shape whose disc grows while a mask carves the crescent and the rays retract, so the change reads as a single object turning rather than two icons swapping. It is presentational — with no `scheme` it follows `colorScheme.current` and needs no wiring; the surrounding button or menu row keeps the role, the name and the state.

`<l-dropdown-item>` gains `check-placement`. A checkbox item puts its check in the leading column, which leaves no room for an icon; `check-placement="end"` moves the check to the trailing edge and frees that column, so a row can show its own glyph and its checked state at once. The default is unchanged.
