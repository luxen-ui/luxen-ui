<p align="center">
  <a href="https://luxen-ui.com">
    <img src="https://raw.githubusercontent.com/luxen-ui/luxen-ui/main/packages/docs/public/logos/luxen.svg" width="72" height="72" alt="Luxen UI" />
  </a>
</p>

<h1 align="center">Luxen UI</h1>

<p align="center">A Web UI library built with modern CSS-first, native HTML and custom HTML elements.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/luxen-ui"><img alt="npm version" src="https://img.shields.io/npm/v/luxen-ui?style=flat-square&color=0a7ea4&label=npm" /></a>
  <a href="https://github.com/luxen-ui/luxen-ui/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/luxen-ui/luxen-ui/ci.yml?style=flat-square&label=CI" /></a>
  <a href="https://bundlephobia.com/package/luxen-ui"><img alt="Bundle size (minzipped)" src="https://img.shields.io/bundlephobia/minzip/luxen-ui?style=flat-square&label=size" /></a>
  <a href="https://github.com/lit/lit/"><img alt="Built with Lit" src="https://img.shields.io/badge/built_with-lit-324fff?style=flat-square" /></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/npm/l/luxen-ui?style=flat-square" /></a>
</p>

## Features

- **Web Components** — Custom elements with the `l-` prefix (e.g. `<l-badge>`, `<l-tooltip>`)
- **CSS-only elements** — Styled with plain CSS classes, no JavaScript required
- **Modular** — Import only what you need (JS and CSS are individually tree-shakeable)
- **CDN-ready** — Ship individual modules directly from a CDN

## Documentation

Visit https://luxen-ui.com to explore the documentation.

## 📦 Elements

| Name           | HTML tag             | Type                                    |
| -------------- | -------------------- | --------------------------------------- |
| Avatar         | `<l-avatar>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Badge          | `<l-badge>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Button         | `<button>`           | ⏣ Native HTML Element                   |
| Carousel       | `<l-carousel>`       | ⬢ Custom HTML Element (with Shadow DOM) |
| Carousel Item  | `<l-carousel-item>`  | ⬢ Custom HTML Element (with Shadow DOM) |
| Close Button   | `<button>`           | ⏣ Native HTML Element                   |
| Dialog         | `<l-dialog>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Disclosure     | `<details>`          | ⏣ Native HTML Element                   |
| Divider        | `<l-divider>`        | ◇ Custom HTML Element (no Shadow DOM)   |
| Drawer         | `<l-drawer>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Dropdown       | `<l-dropdown>`       | ⬢ Custom HTML Element (with Shadow DOM) |
| Dropdown Item  | `<l-dropdown-item>`  | ⬢ Custom HTML Element (with Shadow DOM) |
| Icon           | `<l-icon>`           | ⬢ Custom HTML Element (with Shadow DOM) |
| Input OTP      | `<l-input-otp>`      | ⬡ Progressive Custom HTML Element       |
| Input Stepper  | `<l-input-stepper>`  | ⬡ Progressive Custom HTML Element       |
| Kbd            | `<kbd>`              | ⏣ Native HTML Element                   |
| Popover        | `<l-popover>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Progress       | `<progress>`         | ⏣ Native HTML Element                   |
| Rating         | `<l-rating>`         | ⬢ Custom HTML Element (with Shadow DOM) |
| Select         | `<select>`           | ⏣ Native HTML Element                   |
| Skeleton       | `<l-skeleton>`       | ◇ Custom HTML Element (no Shadow DOM)   |
| Spinner        | `<l-spinner>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Sticky Bar     | `<l-sticky-bar>`     | ⬢ Custom HTML Element (with Shadow DOM) |
| Stories        | `<l-stories>`        | ◇ Custom HTML Element (no Shadow DOM)   |
| Story          | `<l-story>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Stories Viewer | `<l-stories-viewer>` | ⬢ Custom HTML Element (with Shadow DOM) |
| Tabs           | `<l-tabs>`           | ⬡ Progressive Custom HTML Element       |
| Toast          | `<l-toast>`          | ◇ Custom HTML Element (no Shadow DOM)   |
| Tooltip        | `<l-tooltip>`        | ⬢ Custom HTML Element (with Shadow DOM) |
| Tree           | `<l-tree>`           | ⬢ Custom HTML Element (with Shadow DOM) |
| Tree Item      | `<l-tree-item>`      | ⬢ Custom HTML Element (with Shadow DOM) |

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
