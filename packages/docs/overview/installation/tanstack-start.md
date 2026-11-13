---
outline: deep
---

# TanStack Start

Install and configure Luxen UI for TanStack Start.

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

Create `luxen.config.js` at the project root. Replace `l` with your own prefix — `acme` gives `<acme-badge>` and `.acme-button`. This guide keeps `l`.

```js [luxen.config.js]
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  elementPrefix: 'l', // <l-badge>
  cssPrefix: 'l', // .l-button, --l-color-*
});
```

Then load it in `vite.config.ts`:

<!-- prettier-ignore -->
```ts [vite.config.ts]
import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import luxen from 'luxen-ui/vite-plugin'; // [!code ++]

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()], // [!code --]
  plugins: [devtools(), tailwindcss(), luxen(), tanstackStart(), viteReact()], // [!code ++]
});
```

## Import the CSS

```css [src/styles.css]
@import 'tailwindcss';
@import 'luxen-ui/tailwind/preset'; /* [!code ++] */
@import 'luxen-ui/css/preset'; /* [!code ++] */
@import 'luxen-ui/css/button'; /* [!code ++] */
@import 'luxen-ui/css/badge'; /* [!code ++] */
```

`luxen-ui/tailwind/preset` maps Luxen tokens to Tailwind utilities — see [Using with Tailwind](/overview/using-with-tailwind).

## Type the custom elements

Create `src/luxen.d.ts` so TypeScript accepts `<l-*>` tags in JSX:

```ts [src/luxen.d.ts]
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

## Use the elements

<!-- prettier-ignore -->
```tsx [src/routes/index.tsx]
import { createFileRoute } from '@tanstack/react-router';
import 'luxen-ui/badge'; // [!code ++]

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

Each element page lists its imports. Light-DOM elements need both their CSS and their JS; Shadow-DOM elements (`dialog`, `popover`, `tooltip`…) need only the JS.
