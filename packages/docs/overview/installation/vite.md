---
outline: deep
---

# Vite

Install and configure Luxen UI for Vite.

<div class="steps">

## Create project

::: code-group

```bash [npm]
npm create vite@latest my-app -- --template vanilla-ts
```

```bash [pnpm]
pnpm create vite my-app --template vanilla-ts
```

```bash [Yarn]
yarn create vite my-app --template vanilla-ts
```

```bash [Bun]
bun create vite my-app --template vanilla-ts
```

:::

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

Then create `vite.config.ts` to load it:

```ts [vite.config.ts]
import { defineConfig } from 'vite';
import luxen from 'luxen-ui/vite-plugin';

export default defineConfig({
  plugins: [luxen()],
});
```

## Import the CSS

Replace the contents of `src/style.css`:

```css [src/style.css]
@import 'luxen-ui/css/preset';
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/badge';
```

## Import the elements

Replace the contents of `src/main.ts`:

```ts [src/main.ts]
import './style.css';
import 'luxen-ui/badge'; // [!code ++]
```

## Use the elements

<!-- prettier-ignore -->
```html [index.html]
<body>
  <div id="app"></div> <!-- [!code --] -->
  <button class="l-button" data-variant="primary">Save</button> <!-- [!code ++] -->
  <l-badge>New</l-badge> <!-- [!code ++] -->
  <script type="module" src="/src/main.ts"></script>
</body>
```

</div>

Each element page lists its imports. Light-DOM elements need both their CSS and their JS; Shadow-DOM elements (`dialog`, `popover`, `tooltip`…) need only the JS.
