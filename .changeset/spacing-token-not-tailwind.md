---
'luxen-ui': patch
---

Element spacing no longer depends on Tailwind. Six stylesheets read `--spacing` — a variable that belongs to Tailwind's base layer, not to Luxen — so outside a Tailwind project the surrounding `calc()` was invalid at computed-value time, the declaration was dropped, and the gap or padding silently fell back to zero.

Affected: `.l-button` (and every element built on it), `l-kbd`, `l-disclosure`, `l-segmented-control`, and both tab variants. They now use the `--l-spacing-*` tokens, which ship with `luxen-ui/css/tokens` — a required dependency of every element — and hold the same values, so nothing moves in a Tailwind project.

It is worth more than the cosmetics: the collapse first surfaced as a real WCAG 2.5.8 target-size failure, where stacked controls ended up close enough together to breach the minimum spacing once their gap vanished. A test now fails the build if any stylesheet reads `--spacing` without defining it — `l-divider` and `l-rating` expose their own as a public custom property and keep it.
