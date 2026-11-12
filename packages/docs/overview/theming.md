---
outline: deep
---

<script setup>
import preview from '../.vitepress/examples/theming/Preview.html?raw'
</script>

# Theming

<ComponentWrapper :html="preview" />

## Writing a theme

Override tokens on `:root`. Luxen declares its own in `@layer theme`, so yours win whatever the load order:

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

Write colors with `light-dark()` to support both [color schemes](/overview/color-scheme). All tokens are listed on [Design Tokens](/overview/design-tokens).

### In a cascade layer

A theme inside `@layer base`, `components` or `utilities` wins too, as long as the layer order `theme, base, components` is set first. Luxen and Tailwind both declare it; if your CSS loads before them, start it with `@layer theme, base, components;`.

## Showcase themes

Docs-only, not shipped in `luxen-ui`. To reuse one, replace its `:root[data-theme='…']` selector with `:root`.

### Brutalist

Square corners, `2px` ink borders, hard offset shadows, acid yellow. Space Grotesk.

::: details brutalist.css

<<< @/.vitepress/theme/themes/brutalist.css

:::

### Coral

Inspired by the [Airbnb DESIGN.md](https://getdesign.md/airbnb/design-md) analysis (not official). Coral accent, soft corners, `48px` controls. DM Sans.

::: details coral.css

<<< @/.vitepress/theme/themes/coral.css

:::

### Midnight

Inspired by the [Linear DESIGN.md](https://getdesign.md/linear.app/design-md) analysis (not official). Near-black canvas, lavender accent, `6–8px` corners. Inter.

::: details midnight.css

<<< @/.vitepress/theme/themes/midnight.css

:::

### Editorial

Inspired by the [Oura DESIGN.md](https://getdesign.md/oura/design-md) analysis (not official). Cream paper, pill buttons, action blue. Instrument Serif headings over Instrument Sans.

::: details editorial.css

<<< @/.vitepress/theme/themes/editorial.css

:::
