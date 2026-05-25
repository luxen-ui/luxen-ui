---
outline: deep
---

# Customizing the Prefix

Luxen UI ships with `l-` as the default prefix for every identifier it generates — element tags, CSS classes, custom properties, keyframes, and runtime IDs. Rebrand all of them in one go to white-label the library under your own project, organization, or design system.

## Prefix

The Vite plugin reads a `luxen.config.mjs` at the project root and rewrites every prefix-bearing identifier at build time — CSS (variables, classes, type selectors, keyframes) and JS (registry initialisers, shadow-DOM CSS strings). The two prefixes can be the same (e.g. `'ds'`) or different (e.g. `'pulse'` for tags, `'p'` for CSS — terser in stylesheets).

### How it works

<PrefixPipelines />

### Setup

::: code-group

```js [luxen.config.mjs]
import { defineConfig } from 'luxen-ui/config';

export default defineConfig({
  // Tag names and matching CSS type selectors.
  //   <l-toast>      → <pulse-toast>
  //   l-toast { … }  → pulse-toast { … }
  elementPrefix: 'pulse',

  // Every other CSS-side identifier.
  //   .l-button                → .p-button              (CSS class)
  //   --l-color-text-primary   → --p-color-text-primary (custom property)
  //   @keyframes l-toast-fade  → @keyframes p-toast-fade (keyframe)
  //   id="l-toast-0"           → id="p-toast-0"          (generated ID)
  cssPrefix: 'p',
});
```

```ts [vite.config.ts]
import luxen from 'luxen-ui/vite-plugin';

// luxen() reads luxen.config.mjs from the project root. You can also pass
// options inline (e.g. luxen({ elementPrefix: 'pulse', cssPrefix: 'p' })) —
// inline options take precedence over the config file.
export default defineConfig({
  plugins: [luxen()],
});
```

```ts [main.ts]
// No setPrefix() call needed — the Vite plugin rewrites the runtime registry
// at build time, so static imports just work.
import 'luxen-ui/toast';
import 'luxen-ui/dropdown';
```

:::

The same `luxen.config.mjs` is read by the [`luxen-ui generate-skill` CLI](../resources/agent-skills.md), so the AI skill stays in sync with your dev build automatically.

### Default behavior

When no prefix is configured, everything stays on `l-` — no Vite plugin, no setup required.

## TypeScript types

Element classes ship as side-effect-free type entries under `luxen-ui/<name>/element`, including each element's typed prop unions:

```ts
import type { Badge, BadgeVariant } from 'luxen-ui/badge/element';
```

The package does **not** ship an `HTMLElementTagNameMap` augmentation. A bundled map would hardcode `l-*` tags onto every consumer — wrong the moment you rebrand the prefix. Set `emitTypes` in `luxen.config.mjs` to get a project-local map under your prefix:

```js
// luxen.config.mjs
import { defineConfig } from 'luxen-ui/config';

export default defineConfig({
  elementPrefix: 'pulse',
  cssPrefix: 'p',
  emitTypes: 'types/pulse.d.ts',
});
```

The generated file augments `HTMLElementTagNameMap` for every Luxen element under your prefix — so `document.querySelector('pulse-toast')` and `el.variant = …` are fully typed.

::: tip You own the generated file
The plugin writes it once and **never overwrites it silently**. Edit it freely — drop elements you don't use, or add ones from your own custom-element set. If `elementPrefix` later changes, the plugin logs a drift warning so you can regenerate.

```ts
emitTypes: {
  path: 'types/pulse.d.ts',
  force: true, // overwrite the file on every build (skips the once-and-never-touch behaviour above)
  elements: ['badge', 'dropdown', 'popover'], // optional: restrict to a subset
}
```

:::

## Vue & Nuxt — strict templates

`HTMLElementTagNameMap` types the DOM side (`querySelector`, property access) but Vue's template checker treats custom elements as a permissive surface — typos and bad prop values are **not** flagged. Pass `target: 'vue'` to additionally augment Vue's `GlobalComponents`:

```js
// luxen.config.mjs
import { defineConfig } from 'luxen-ui/config';

export default defineConfig({
  elementPrefix: 'pulse',
  cssPrefix: 'p',
  emitTypes: { path: 'types/pulse.d.ts', target: 'vue' },
});
```

Then enable strict templates in your tsconfig (for Nuxt, set it via `nuxt.config.ts` → `typescript.tsConfig.vueCompilerOptions`):

```jsonc
{
  "vueCompilerOptions": { "strictTemplates": true },
}
```

Now `<pulse-badge variant="bogus">` and `<pulse-badge typo="x">` are errors in the editor and in `vue-tsc`, while autocomplete stays scoped to each element's real props. The generated file also re-allows `data-*` and `slot` on native elements (which `strictTemplates` would otherwise reject) and keeps `@event` listeners permissive.

### Installed under an npm alias

If the package is aliased in `package.json`, pass `packageName` so the emitted imports resolve:

::: code-group

```jsonc [package.json]
{ "dependencies": { "pulse-ui": "npm:luxen-ui@^0.5.0" } }
```

```js [luxen.config.mjs]
import { defineConfig } from 'pulse-ui/config'; // ← use the npm alias name

export default defineConfig({
  elementPrefix: 'pulse',
  cssPrefix: 'p',
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
