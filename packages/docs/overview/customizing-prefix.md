---
outline: deep
---

# Customizing the Prefix

Luxen UI ships with `l-` as the default prefix for every identifier it generates — element tags, CSS classes, custom properties, keyframes, and runtime IDs. Rebrand all of them in one go to white-label the library under your own project, organization, or design system.

There are three things to wire up, and you only reach for the ones you need:

| You want…                                       | Configure                                |
| ----------------------------------------------- | ---------------------------------------- |
| Rebranded tags, classes, tokens, keyframes, IDs | [Prefix](#prefix) (build + runtime)      |
| `HTMLElementTagNameMap` typed for your prefix   | [TypeScript types](#typescript-types)    |
| Strict prop/typo checking in `.vue` templates   | [Vue & Nuxt](#vue-nuxt-strict-templates) |

## Prefix

Renaming the prefix touches **two layers**, each with its own integration point. Both must be wired up — they cover non-overlapping namespaces.

<PrefixPipelines />

::: tip Why two layers?
The Vite plugin rewrites every CSS file the library ships — including the per-element stylesheets bundled into Shadow DOM. The runtime call only covers identifiers JavaScript generates on the fly: tag names, generated IDs, and classes added from script.
:::

### Setup

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

### Default behavior

When no prefix is configured, everything stays on `l-` — no Vite plugin, no `setPrefix()` call, no setup required.

## TypeScript types

Element classes ship as side-effect-free type entries under `luxen-ui/<name>/element`, including each element's typed prop unions:

```ts
import type { Badge, BadgeVariant } from 'luxen-ui/badge/element';
```

The package does **not** ship an `HTMLElementTagNameMap` augmentation. A bundled map would hardcode `l-*` tags onto every consumer — wrong the moment you rebrand the prefix. Instead, the Vite plugin writes a project-local map that reflects the prefix you actually use:

```ts
// vite.config.ts (or nuxt.config.ts)
luxen({
  elementPrefix: 'luxen',
  cssPrefix: 'lx',
  emitTypes: 'types/luxen.d.ts', // ← written on first build
});
```

The generated file imports the class types from the `*/element` subpaths and augments `HTMLElementTagNameMap` for every Luxen element under your prefix — so `document.querySelector('luxen-toast')` and `el.variant = …` are fully typed.

::: tip You own the generated file
The plugin writes it once and **never overwrites it silently**. Edit it freely — drop elements you don't use, or add ones from your own custom-element set. If `elementPrefix` later changes, the plugin logs a drift warning so you can regenerate. To rewrite on purpose, pass `force`:

```ts
emitTypes: { path: 'types/luxen.d.ts', force: true }
```

:::

Need a subset only? List the element base names:

```ts
emitTypes: { path: 'types/luxen.d.ts', elements: ['badge', 'dropdown', 'popover'] }
```

## Vue & Nuxt — strict templates

`HTMLElementTagNameMap` types the DOM side (`querySelector`, property access) but Vue's template checker treats custom elements as a permissive surface — typos and bad prop values are **not** flagged. Pass `target: 'vue'` to additionally augment Vue's `GlobalComponents`:

```ts
luxen({
  elementPrefix: 'luxen',
  cssPrefix: 'lx',
  emitTypes: { path: 'types/luxen.d.ts', target: 'vue' },
});
```

Then enable strict templates in your tsconfig (for Nuxt, set it via `nuxt.config.ts` → `typescript.tsConfig.vueCompilerOptions`):

```jsonc
{
  "vueCompilerOptions": { "strictTemplates": true },
}
```

Now `<luxen-badge variant="bogus">` and `<luxen-badge typo="x">` are errors in the editor and in `vue-tsc`, while autocomplete stays scoped to each element's real props. The generated file also re-allows `data-*` and `slot` on native elements (which `strictTemplates` would otherwise reject) and keeps `@event` listeners permissive.

### Installed under an npm alias

If the package is aliased in `package.json`, pass `packageName` so the emitted imports resolve:

::: code-group

```jsonc [package.json]
{ "dependencies": { "pulse-ui": "npm:luxen-ui@^0.5.0" } }
```

```ts [vite.config.ts]
luxen({
  elementPrefix: 'pulse',
  cssPrefix: 'pulse',
  emitTypes: { path: 'types/pulse.d.ts', target: 'vue', packageName: 'pulse-ui' },
});
```

:::

## `emitTypes` reference

`emitTypes` accepts a string (shorthand for `{ path }`) or an options object:

| Option        | Type             | Default      | Description                                                                                |
| ------------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------ |
| `path`        | `string`         | —            | Where to write the declaration file, relative to the project root.                         |
| `target`      | `'dom' \| 'vue'` | `'dom'`      | `'dom'` augments `HTMLElementTagNameMap`; `'vue'` also augments `GlobalComponents`.        |
| `elements`    | `string[]`       | all elements | Subset of element base names to include (e.g. `['badge', 'toast']`).                       |
| `packageName` | `string`         | `'luxen-ui'` | Package specifier used in the emitted imports — set it when installed under an npm alias.  |
| `force`       | `boolean`        | `false`      | Overwrite the file if it already exists. Without it, the plugin never replaces your edits. |
