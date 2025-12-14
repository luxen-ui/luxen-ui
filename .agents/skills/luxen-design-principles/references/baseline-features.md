# Baseline Feature Reference

The project targets `"baseline newly available"` (see `package.json` browserslist config).

## Baseline Widely Available (safe)

`@layer`, `color-mix()`, `:has()`, `:is()`, `mask`, custom properties, `@keyframes`, `@media`, `::before`/`::after`, `aspect-ratio`, `place-items`, `gap`, `inline-flex`, `inset`, `user-select`, `outline`/`outline-offset`, `scale`/`translate`, `@container`

## Baseline Newly Available (safe — matches target)

CSS nesting (`&`), `light-dark()`, `@starting-style`, `allow-discrete`, `color-scheme`, `:open`/`:closed`, `dvb`/`dvh` units, `@scope`, `@property`, `:popover-open`, `popover` attribute, `::backdrop` (for popover), `ElementInternals`, `:state()` custom states, Form Associated Custom Elements

## NOT in Baseline (progressive enhancement only)

- `if(style(...): ...)` — CSSWG draft, Chrome 137+. Always provide `var()` fallback.
- `corner-shape` — CSS proposal, Chrome only
- `text-box` — CSS Inline Layout Level 4, limited support
- `::picker(select)` / `appearance: base-select` — Customizable select, Chrome 134+
- `::checkmark` / `::picker-icon` — Part of customizable select
- `contrast-color()` — CSS Color Level 5, limited support
- `@function` — CSS Functions and Mixins, no broad support
- `@mixin` — CSS Functions and Mixins, no broad support
- `random()` / `sibling-count()` / `sibling-index()` — CSS Values Level 5, limited support

For unlisted features, check the current Baseline status at https://web.dev/baseline or via web search.
