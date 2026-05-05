# Luxen UI

[![npm version](https://img.shields.io/npm/v/luxen-ui.svg)](https://www.npmjs.com/package/luxen-ui)
[![lit](https://img.shields.io/badge/lib-lit-1e40af.svg)](https://github.com/lit/lit/)
[![CI](https://img.shields.io/github/actions/workflow/status/zedix/luxen-ui/ci.yml?label=CI&color=1a7f37)](https://github.com/zedix/luxen-ui/actions/workflows/ci.yml)
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
