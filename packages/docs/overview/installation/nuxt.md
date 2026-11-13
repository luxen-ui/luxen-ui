---
outline: deep
---

# Nuxt

Install and configure Luxen UI for Nuxt.

## Create project

::: code-group

```bash [npm]
npm create nuxt@latest my-app
```

```bash [pnpm]
pnpm create nuxt@latest my-app
```

```bash [Yarn]
yarn create nuxt@latest my-app
```

```bash [Bun]
bun create nuxt@latest my-app
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

## Configure Nuxt

<!-- prettier-ignore -->
```ts [nuxt.config.ts]
import luxen from 'luxen-ui/vite-plugin'; // [!code ++]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // [!code ++:7]
  css: ['~/assets/css/main.css'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('l-'), // match elementPrefix
    },
  },
  vite: { plugins: [luxen()] },
});
```

## Import the CSS

```css [app/assets/css/main.css]
@import 'luxen-ui/css/preset';
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/badge';
```

## Import the elements

```ts [app/plugins/luxen.client.ts]
import 'luxen-ui/badge';

export default defineNuxtPlugin(() => {});
```

## Use the elements

<!-- prettier-ignore -->
```vue [app/app.vue]
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome /> <!-- [!code --] -->
    <button class="l-button" data-variant="primary">Save</button> <!-- [!code ++] -->
    <l-badge>New</l-badge> <!-- [!code ++] -->
  </div>
</template>
```

Each element page lists its imports. Light-DOM elements need both their CSS and their JS; Shadow-DOM elements (`dialog`, `popover`, `tooltip`…) need only the JS.
