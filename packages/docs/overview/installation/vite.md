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

Then create `vite.config.ts` to load it:

::: code-group

```ts [vite.config.ts]
import { defineConfig } from 'vite';
import luxen from 'luxen-ui/vite-plugin';

export default defineConfig({
  plugins: [luxen()],
});
```

:::

## Import the CSS

Replace the contents of `src/style.css`:

::: code-group

<!-- prettier-ignore -->
```css [src/style.css]
<!--@include: ./_snippets/imports.css-->
```

:::

## Import the elements

Replace the contents of `src/main.ts`:

::: code-group

<!-- prettier-ignore -->
```ts [src/main.ts]
import './style.css';

<!--@include: ./_snippets/imports.ts-->
```

:::

## Use the elements

::: code-group

<!-- prettier-ignore -->
```html [index.html]
<body>
  <div id="app"></div> <!-- [!code --] -->
  <button class="l-button" data-variant="primary">Save</button> <!-- [!code ++] -->
  <l-badge>New</l-badge> <!-- [!code ++] -->
  <script type="module" src="/src/main.ts"></script>
</body>
```

:::

</div>
