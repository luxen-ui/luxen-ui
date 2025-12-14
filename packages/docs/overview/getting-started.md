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

Import the full bundle or individual element stylesheets:

::: code-group

```css [Individual]
/* Design tokens + base styles */
@import 'luxen-ui/css/base';

/* Elements */
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/badge';
```

```css [All elements]
/* Design tokens + base styles + all elements */
@import 'luxen-ui/css';
```

:::

## Options

```html
<button
  class="l-button"
  data-variant="primary"
>
  Save
</button>
```

For custom elements that require JavaScript (dialog, select), also import the element module:

```js
import 'luxen-ui/dialog';
```

## Browser Support

Luxen UI targets [Baseline Newly Available](https://web.dev/baseline) browsers.
