---
outline: deep
---

# Manual installation

Add Luxen UI to any project with a bundler.

<div class="steps">

## Install Luxen UI

::: code-group

```bash [npm]
npm install luxen-ui
```

```bash [pnpm]
pnpm add luxen-ui
```

```bash [Yarn]
yarn add luxen-ui
```

```bash [Bun]
bun add luxen-ui
```

:::

## Configure the prefix

Create `luxen.config.js` at the project root. Replace `l` with your own prefix — `acme` gives `<acme-badge>` and `.acme-button`. This guide keeps `l`.

```js [luxen.config.js]
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  elementPrefix: 'l', // <l-badge>
  cssPrefix: 'l', // .l-button, --l-color-*
});
```

Register `luxen-ui/vite-plugin` in your Vite config to apply it — see [Customizing the prefix](/overview/customizing-prefix).

## Import the CSS

`luxen-ui/css/preset` brings the design tokens and base styles. Add one import per element you use:

```css [CSS]
@import 'luxen-ui/css/preset';
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/badge';
```

## Import the elements

Custom elements (`<l-*>` tags) need their JS module to upgrade:

```js [JS]
import 'luxen-ui/badge';
import 'luxen-ui/dialog';
```

Light-DOM elements (`badge`, `divider`, `toast`…) need both their CSS and their JS; Shadow-DOM elements (`dialog`, `popover`, `tooltip`…) need only the JS. CSS-only elements (`button`, `disclosure`, `kbd`…) need no JS.

</div>

## Atomic imports

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

To own every semantic alias, eject them with `npx luxen-ui import design-tokens` and swap the `aliases` import for your copy — see the [CLI](/overview/cli#import). For a few overrides, write a [theme](/overview/theming) instead.
