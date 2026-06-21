# Luxen UI

[![npm version](https://img.shields.io/npm/v/luxen-ui.svg)](https://www.npmjs.com/package/luxen-ui)
[![lit](https://img.shields.io/badge/lib-lit-1e40af.svg)](https://github.com/lit/lit/)
[![CI](https://img.shields.io/github/actions/workflow/status/luxen-ui/luxen-ui/ci.yml?label=CI&color=1a7f37)](https://github.com/luxen-ui/luxen-ui/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green.svg)

A Web UI library built with with modern CSS-first, native HTML and custom HTML elements.

## Features

- **Web Components** — Custom elements with the `l-` prefix (e.g. `<l-badge>`, `<l-tooltip>`)
- **CSS-only elements** — Styled with plain CSS classes, no JavaScript required
- **Modular** — Import only what you need (JS and CSS are individually tree-shakeable)
- **CDN-ready** — Ship individual modules directly from a CDN

## Documentation

Visit https://luxen-ui.com to explore the documentation.

## 📦 Elements

<!-- elements-table:start -->

| Name           | HTML tag             | Type                                    |
| -------------- | -------------------- | --------------------------------------- |
| Alert          | `<l-alert>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Alert dialog   | `<l-alert-dialog>`   | ⬢ Custom HTML Element (with Shadow DOM) |
| Avatar         | `<l-avatar>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Badge          | `<l-badge>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Breadcrumb     | `<nav>`              | ⏣ Native HTML Element                   |
| Button         | `<button>`           | ⏣ Native HTML Element                   |
| Button group   | `<l-button-group>`   | ◇ Custom HTML Element (no Shadow DOM)   |
| Carousel       | `<l-carousel>`       | ⬢ Custom HTML Element (with Shadow DOM) |
| Carousel item  | `<l-carousel-item>`  | ⬢ Custom HTML Element (with Shadow DOM) |
| Checkbox       | `<input>`            | ⏣ Native HTML Element                   |
| Close button   | `<button>`           | ⏣ Native HTML Element                   |
| Dialog         | `<l-dialog>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Disclosure     | `<details>`          | ⏣ Native HTML Element                   |
| Divider        | `<l-divider>`        | ◇ Custom HTML Element (no Shadow DOM)   |
| Drawer         | `<l-drawer>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Dropdown       | `<l-dropdown>`       | ⬢ Custom HTML Element (with Shadow DOM) |
| Dropdown item  | `<l-dropdown-item>`  | ⬢ Custom HTML Element (with Shadow DOM) |
| Dropdown label | `<l-dropdown-label>` | ⬢ Custom HTML Element (with Shadow DOM) |
| Form field     | `<l-form-field>`     | ⬡ Progressive Custom HTML Element       |
| Icon           | `<l-icon>`           | ⬢ Custom HTML Element (with Shadow DOM) |
| Input          | `<input>`            | ⏣ Native HTML Element                   |
| Input group    | `<l-input-group>`    | ⬡ Progressive Custom HTML Element       |
| Input OTP      | `<l-input-otp>`      | ⬡ Progressive Custom HTML Element       |
| Input stepper  | `<l-input-stepper>`  | ⬡ Progressive Custom HTML Element       |
| Kbd            | `<kbd>`              | ⏣ Native HTML Element                   |
| Popover        | `<l-popover>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Progress       | `<progress>`         | ⏣ Native HTML Element                   |
| Prose editor   | `<l-prose-editor>`   | ⬢ Custom HTML Element (with Shadow DOM) |
| Radio          | `<input>`            | ⏣ Native HTML Element                   |
| Rating         | `<l-rating>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Select         | `<select>`           | ⏣ Native HTML Element                   |
| Skeleton       | `<l-skeleton>`       | ◇ Custom HTML Element (no Shadow DOM)   |
| Slider         | `<l-slider>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Spinner        | `<l-spinner>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Sticky bar     | `<l-sticky-bar>`     | ⬢ Custom HTML Element (with Shadow DOM) |
| Stories        | `<l-stories>`        | ◇ Custom HTML Element (no Shadow DOM)   |
| Stories viewer | `<l-stories-viewer>` | ⬢ Custom HTML Element (with Shadow DOM) |
| Story          | `<l-story>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Switch         | `<input>`            | ⏣ Native HTML Element                   |
| Tabs           | `<l-tabs>`           | ⬡ Progressive Custom HTML Element       |
| Textarea       | `<textarea>`         | ⏣ Native HTML Element                   |
| Toast          | `<l-toast>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Tooltip        | `<l-tooltip>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Tree           | `<l-tree>`           | ⬢ Custom HTML Element (with Shadow DOM) |
| Tree item      | `<l-tree-item>`      | ⬢ Custom HTML Element (with Shadow DOM) |

_⏣ Native HTML Element · ⬡ Progressive Custom HTML Element · ◇ Custom HTML Element (no Shadow DOM) · ⬢ Custom HTML Element (with Shadow DOM)_

<!-- elements-table:end -->

## Install

```bash
npm install luxen-ui
```

## Usage

```js
// Import a web component
import 'luxen-ui/tooltip';

// Import a CSS-only element
import 'luxen-ui/css/button';
```

```html
<button
  id="my-button"
  type="button"
  class="l-button"
>
  Hover me
</button>
<l-tooltip for="my-button">Hello world</l-tooltip>
```

## TypeScript (prefix-aware)

Element classes are exported under `luxen-ui/<name>/element` as side-effect-free
type entries:

```ts
import type { Badge, BadgeVariant } from 'luxen-ui/badge/element';
```

The package does **not** ship a `HTMLElementTagNameMap` augmentation by
default — consumers own that file so it always reflects the prefix they
actually use (default `l-*` or rebranded). The Vite plugin can write it for
you:

```ts
// vite.config.ts (or nuxt.config.ts)
import luxen from 'luxen-ui/vite-plugin';

export default defineConfig({
  plugins: [
    luxen({
      elementPrefix: 'pulse',
      cssPrefix: 'pulse',
      emitTypes: 'types/luxen.d.ts', // ← writes the file on first build
    }),
  ],
});
```

The generated `types/luxen.d.ts` imports the class types from the
`*/element` subpaths and augments `HTMLElementTagNameMap` for every Luxen
element under your prefix. Once written:

- **You own the file.** Edit it freely — drop elements you don't use, or
  add ones from your own custom element set.
- **The plugin never overwrites** an existing file silently. Pass
  `emitTypes: { path: 'types/luxen.d.ts', force: true }` to regenerate.
- **Drift detection.** If your `elementPrefix` later changes, the plugin
  logs a warning so you can regenerate.

Need a subset only?

```ts
luxen({
  elementPrefix: 'pulse',
  emitTypes: { path: 'types/luxen.d.ts', elements: ['badge', 'dropdown', 'popover'] },
});
```

### Vue / Nuxt — strict template checking

`HTMLElementTagNameMap` types the DOM side (`document.querySelector`,
`el.variant = …`) but Vue's template checker treats custom elements as a
permissive surface — typos and bad prop values are **not** flagged. Use
`target: 'vue'` to additionally augment Vue's `GlobalComponents`:

```ts
luxen({
  elementPrefix: 'pulse',
  cssPrefix: 'pulse',
  emitTypes: { path: 'types/luxen.d.ts', target: 'vue' },
});
```

Then enable strict templates in your tsconfig (for Nuxt, set it via
`nuxt.config.ts` → `typescript.tsConfig.vueCompilerOptions`):

```jsonc
{
  "vueCompilerOptions": { "strictTemplates": true },
}
```

Now `<pulse-badge variant="bogus">` and `<pulse-badge typo="x">` are errors
in the editor and in `vue-tsc`, while autocomplete stays scoped to each
element's real props. The generated file also re-allows `data-*` and `slot`
on native elements (which `strictTemplates` would otherwise reject) and keeps
`@event` listeners permissive.

Installed under an npm alias? Pass `packageName` so the emitted imports
resolve:

```jsonc
// package.json
{ "dependencies": { "pulse-ui": "npm:luxen-ui@^0.5.0" } }
```

```ts
emitTypes: { path: 'types/luxen.d.ts', target: 'vue', packageName: 'pulse-ui' }
```

## Local Development

Requires **Node.js >= 24** and **pnpm**.

```bash
pnpm install
pnpm build
```

```bash
# Dev servers
cd packages/ui && pnpm dev           # CSS watch
cd packages/ui && pnpm dev:elements  # Vite dev server
cd packages/docs && pnpm dev         # Docs (VitePress)
```

## License

Licensed under the [MIT license](./LICENSE).
