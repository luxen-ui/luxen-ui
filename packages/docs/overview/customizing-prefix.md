---
outline: deep
---

# Customizing the Prefix

Luxen UI ships with `l-` as the default prefix for every identifier it generates — element tags, CSS classes, custom properties, keyframes, and runtime IDs. You can rebrand all of them in one go to fit your project, organization, or design system.

## How it works

Customization touches **two layers**, each with its own integration point. Both must be wired up — they cover different identifiers.

<PrefixPipelines />

::: tip Why two layers?
The Vite plugin rewrites every CSS file the library ships — including the per-element stylesheets bundled into Shadow DOM. The runtime call only covers identifiers JavaScript generates on the fly: tag names, generated IDs, and classes added from script.
:::

## Setup

Two changes — one for the build, one for the entry point. The two prefix options can be the same string (e.g. `'ds'` for both) or different (e.g. `'luxen'` for tags, `'lx'` for CSS — terser in stylesheets).

::: code-group

```ts [vite.config.ts]
import luxen from 'luxen-ui/vite-plugin';

export default defineConfig({
  plugins: [
    luxen({
      // Prefix for custom-element tag names and matching CSS type selectors.
      //   <l-toast>      → <luxen-toast>
      //   l-toast { … }  → luxen-toast { … }
      elementPrefix: 'luxen',

      // Prefix for every other CSS-side identifier:
      //   .l-button                → .lx-button              (CSS class)
      //   --l-color-text-primary   → --lx-color-text-primary (custom property)
      //   @keyframes l-toast-fade  → @keyframes lx-toast-fade (keyframe)
      //   id="l-toast-0"           → id="lx-toast-0"          (generated ID)
      cssPrefix: 'lx',
    }),
  ],
});
```

```ts [main.ts]
// 1. Set the prefix BEFORE any element module is imported
import { setPrefix } from 'luxen-ui';
setPrefix({ element: 'luxen', css: 'lx' });

// 2. Then dynamically import the elements you use
await import('luxen-ui/toast');
await import('luxen-ui/dropdown');
```

:::

::: warning Import order matters
`setPrefix()` must run **before** any `luxen-ui/<element>` module evaluates — otherwise that element registers itself with the default `l-` tag name and the call has no effect on tag names, generated IDs, or runtime-added classes.

Static `import` statements are hoisted by the JS engine, so they execute before any function call in the file. Use **dynamic `import()`** as shown above, or split the prefix call and the element imports into two separate files loaded in order.
:::

## Default behavior

When no prefix is configured, everything stays on `l-` — no Vite plugin, no `setPrefix()` call, no setup required.
