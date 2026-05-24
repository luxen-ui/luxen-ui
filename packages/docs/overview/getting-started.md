---
outline: deep
---

# Quick Start

Luxen UI is an HTML & CSS-first UI library built with modern CSS and HTML custom elements.

## Installation

::: code-group

```bash [Yarn]
yarn add luxen-ui
```

```bash [npm]
npm install luxen-ui
```

```bash [pnpm]
pnpm add luxen-ui
```

```bash [Bun]
bun add luxen-ui
```

:::

## Import CSS

`luxen-ui/css/preset` is the opinionated default — runtime base + design tokens. Add per-element styles for what you use :

```css [CSS]
@import 'luxen-ui/css/preset';

/* CSS-only elements — apply a Luxen class to a native HTML tag, no JS needed.
   Available: button, close-button (ring|square|circle), disclosure, kbd, progress, select. */
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/disclosure';

/* Light-DOM custom elements — need their JS module too (see Import JS below). */
@import 'luxen-ui/css/badge';
@import 'luxen-ui/css/toast';
```

### Atomic imports (advanced)

The preset composes from smaller layers you can swap independently:

| Import                           | What it contains                                                               |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `luxen-ui/css/preset`            | Opinionated default — `base` + `tokens` in one import.                         |
| `luxen-ui/css/base`              | Runtime helpers (`.l-visually-hidden`, custom element FOUC fix). No tokens.    |
| `luxen-ui/css/tokens`            | Primitives + semantic aliases.                                                 |
| `luxen-ui/css/tokens/primitives` | Core palette (5 families) + spacing + radius + text + …                        |
| `luxen-ui/css/tokens/aliases`    | Semantic aliases only — `--l-color-text-primary`, etc.                         |
| `luxen-ui/css/tokens/palette`    | The remaining 21 Tailwind palette families (opt-in).                           |
| `luxen-ui/tailwind/preset`       | Tailwind v4 bridge — see [Using with Tailwind](/overview/using-with-tailwind). |
| `luxen-ui/css/<element>`         | Per-element styles.                                                            |

Use the atomics when you want to swap one layer — e.g. plug in [Radix UI colors](https://www.radix-ui.com/colors) as primitives while keeping Luxen aliases. See "Customizing tokens" below.

## Import JS

Custom elements (`<l-foo>` tags) need their JavaScript module to upgrade :

```js [JS]
// Light-DOM elements (badge, divider, toast, …) need both their JS module
// AND the matching @import 'luxen-ui/css/<element>'.
// Shadow-DOM elements (dialog, popover, tooltip, …) need only the JS —
// styles ship inside the module.
import 'luxen-ui/badge';
import 'luxen-ui/dialog';
```

## Customizing tokens

For one-off overrides, just redefine the alias in your CSS:

```css
:root {
  --l-color-bg-fill-brand: light-dark(var(--l-color-rose-600), var(--l-color-rose-400));
}
```

For full ownership of every alias (semantic mappings, descriptions inline), copy the file into your project:

```bash
npx luxen-ui import design-tokens
# → ./luxen-design-tokens.css
```

Then swap the alias import for your customized one:

```css
@import 'luxen-ui/css/base';
@import 'luxen-ui/css/tokens/primitives'; /* or your own palette */
@import './luxen-design-tokens.css';
```

## Browser Support

Luxen UI targets [Baseline Newly Available](https://web.dev/baseline) browsers.
