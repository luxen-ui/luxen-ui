---
outline: deep
aside: false
---

# Design Tokens

Semantic CSS custom properties (`--l-*`) that drive every Luxen UI element. They
build on Luxen's own oklch palette and resolve light/dark automatically via
`light-dark()`. Always reference these semantic tokens — never raw palette
colors — so theming and dark mode propagate everywhere.

The primitive palette is vendored from [Tailwind CSS v4](https://tailwindcss.com/docs/colors) — same 26 oklch families, same values, locked at sync time so Tailwind version bumps don't shift your design.

Reference tokens canonically as `var(--l-color-*)` in your CSS. If you use
Tailwind, the [bridge](/overview/using-with-tailwind) exposes them as semantic
utility classes (`text-primary`, `bg-fill-brand`, `bg-fill-info-soft`,
`border-interactive`, …).

Click any token name to copy its `var(…)` reference.

## Color · Text

<DesignTokens category="text" />

## Color · Surface

<DesignTokens category="surface" />

## Color · Border

<DesignTokens category="border" />

## Color · Fill

Three-tier status scale ordered by visual weight: **soft** (palest tint),
**subtle** (clearly tinted), **strong** (full-intensity solid).

<DesignTokens category="fill" />

## Shadow

Elevation scale for floating surfaces, ordered by how far they lift off the page: **sm** (resting cards), **md** (overlays anchored to a trigger), **lg** (detached floating panels). Each shadow's color uses `light-dark()` so it deepens in dark mode, where a faint black cast would otherwise disappear.

<DesignTokens category="shadow" />

## Sizing

Standard interactive control heights.

<DesignTokens category="sizing" />

## Spacing

Single-source scale: `--l-spacing` is the unit, every step is derived via `calc(var(--l-spacing) * N)`. Override `--l-spacing` to scale the whole UI's rhythm without touching individual steps.

<DesignTokens category="spacing" />
