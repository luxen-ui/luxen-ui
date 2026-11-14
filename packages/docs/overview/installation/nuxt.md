---
outline: deep
---

# Nuxt

Install and configure Luxen UI for Nuxt.

<div class="steps">

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

Create `luxen.config.js` at the project root. Uncomment to rename the `l-` prefix.

::: code-group

```js [luxen.config.js]
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  // elementPrefix: 'my', // <my-badge>
  // cssPrefix: 'my', // .my-button, --my-color-*
});
```

:::

## Configure Nuxt

::: code-group

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

:::

## Import the CSS

::: code-group

<!-- prettier-ignore -->
```css [app/assets/css/main.css]
<!--@include: ./_snippets/imports.css-->
```

:::

## Import the elements

::: code-group

<!-- prettier-ignore -->
```ts [app/plugins/luxen.client.ts]
<!--@include: ./_snippets/imports.ts-->
export default defineNuxtPlugin(() => {});
```

:::

## Use the elements

::: code-group

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

:::

</div>
