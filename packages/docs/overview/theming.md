---
outline: deep
---

<script setup>
import preview from '../.vitepress/examples/theming/Preview.html?raw'
</script>

# Theming

A Luxen theme is a block of `--l-*` CSS custom properties. Elements read only semantic tokens — `--l-color-bg-fill-brand`, `--l-radius-md`, `--l-font-sans` — so overriding them re-skins every element at once, with no rebuild and no element-specific CSS.

Pick a theme from the **Theme** menu in the header: the card below, and every preview on this site, follows it.

<ComponentWrapper :html="preview" />

## Writing a theme

Override semantic tokens on `:root`. Luxen declares its own inside `@layer theme`, the layer Tailwind v4 uses for its theme variables, so a theme outside any layer wins wherever it loads, before or after Luxen's CSS:

```css
:root {
  --l-font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;

  --l-color-bg-fill-brand: light-dark(#0369a1, #38bdf8);
  --l-color-bg-fill-brand-hover: light-dark(#075985, #7dd3fc);
  --l-color-bg-fill-brand-active: light-dark(#0c4a6e, #bae6fd);
  --l-color-text-on-fill-brand: light-dark(#ffffff, #082f49);
  --l-form-control-activated-color: var(--l-color-bg-fill-brand);

  --l-radius-sm: 0.5rem;
  --l-radius-md: 0.75rem;
  --l-radius-lg: 1rem;
}
```

Write each color with `light-dark()` so the theme keeps working in both [color schemes](/overview/color-scheme). The full list of tokens is on the [Design Tokens](/overview/design-tokens) page.

### In a cascade layer

A theme inside a layer wins when that layer comes after `theme`. Every Luxen stylesheet, element skins included, opens with `@layer theme, base, components;`, and Tailwind's with the same order plus `utilities`, so `base`, `components` and `utilities` all qualify.

The first stylesheet to name a layer fixes its place, though: if your `@layer base` rule loads before any Luxen or Tailwind CSS, `base` is created first, lands below `theme`, and Luxen's tokens win. Load Luxen first, or start your CSS with `@layer theme, base, components;`.

## Showcase themes

The themes in the header menu are docs-only — they are not shipped in `luxen-ui`. Copy one as a starting point, replacing its `:root[data-theme='…']` selector with `:root`.

### Brutalist

Square corners, `2px` ink borders, hard offset shadows and a single acid-yellow accent, set in Space Grotesk.

::: details brutalist.css

<<< @/.vitepress/theme/themes/brutalist.css

:::

### Coral

Inspired by the [Airbnb DESIGN.md](https://getdesign.md/airbnb/design-md) analysis on getdesign.md — not an official Airbnb design system. White canvas, near-black ink, a coral accent, soft rounded shapes and roomy `48px` controls, set in DM Sans in place of the proprietary Airbnb Cereal.

::: details coral.css

<<< @/.vitepress/theme/themes/coral.css

:::

### Midnight

Inspired by the [Linear DESIGN.md](https://getdesign.md/linear.app/design-md) analysis on getdesign.md — not an official Linear design system. Dark-first: a near-black canvas, cool gray type, one lavender accent and crisp `6–8px` corners, set in Inter.

::: details midnight.css

<<< @/.vitepress/theme/themes/midnight.css

:::

### Editorial

Inspired by the [Oura DESIGN.md](https://getdesign.md/oura/design-md) analysis on getdesign.md — not an official Oura design system. Warm cream paper, a stone-and-earth palette, pill buttons and a single action blue. Headings switch to Instrument Serif over Instrument Sans, standing in for the proprietary Editorial New and Akkurat.

::: details editorial.css

<<< @/.vitepress/theme/themes/editorial.css

:::
