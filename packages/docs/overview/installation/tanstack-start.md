---
outline: deep
---

# TanStack Start

Install and configure Luxen UI for TanStack Start.

<div class="steps">

## Create project

Pick React. The scaffold comes with Tailwind CSS.

::: code-group

```bash [npm]
npx @tanstack/cli@latest create my-app
```

```bash [pnpm]
pnpm dlx @tanstack/cli@latest create my-app
```

```bash [Yarn]
yarn dlx @tanstack/cli@latest create my-app
```

```bash [Bun]
bunx @tanstack/cli@latest create my-app
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

Then load it in `vite.config.ts`:

::: code-group

<!-- prettier-ignore -->
```ts [vite.config.ts]
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import luxen from 'luxen-ui/vite-plugin' // [!code ++]

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()], // [!code --]
  plugins: [devtools(), tailwindcss(), luxen(), tanstackStart(), viteReact()], // [!code ++]
})

export default config
```

:::

## Import the CSS

::: code-group

<!-- prettier-ignore -->
```css [src/styles.css]
@import 'tailwindcss';
/* [!code ++:99] */
/* ── Optional · Luxen tokens as Tailwind utilities ───────── */
@import 'luxen-ui/tailwind/preset';

<!--@include: ./_snippets/imports.css-->
```

:::

## Import the elements

::: code-group

<!-- prettier-ignore -->
```ts [src/luxen.ts]
<!--@include: ./_snippets/imports.ts-->
```

:::

Then import it once in the root route:

::: code-group

```tsx [src/routes/__root.tsx]
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import '../luxen'; // [!code ++]
```

:::

## Type the custom elements

Create `src/custom-elements.d.ts` so TypeScript accepts `<l-*>` tags in JSX:

::: code-group

```ts [src/custom-elements.d.ts]
import type { HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // match elementPrefix
      [tag: `l-${string}`]: HTMLAttributes<HTMLElement> & Record<string, unknown>;
    }
  }
}
```

:::

## Use the elements

::: code-group

<!-- prettier-ignore -->
```tsx [src/routes/index.tsx]
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div className="p-8">
      {/* [!code --:2] */}
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">Edit <code>src/routes/index.tsx</code> to get started.</p>
      {/* [!code ++:2] */}
      <button className="l-button" data-variant="primary">Save</button>
      <l-badge>New</l-badge>
    </div>
  );
}
```

:::

</div>
