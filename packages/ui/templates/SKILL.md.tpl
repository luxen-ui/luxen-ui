---
name: {{name}}
description: >-
  {{description}}
metadata:
  source: luxen-ui
  source-version: "{{sourceVersion}}"
---

# {{displayName}}

A CSS-first web component library built on web standards. Most elements are plain CSS classes on native HTML; custom elements (like `<l-badge>`) use Lit with minimal Shadow DOM.

Two consumption modes — read the right reference file.

## Mode 1 — Integration (real application)

You import `{{name}}` from npm and bundle with Vite/Webpack. Code samples below use the `l-` prefix.

→ **[references/integration.md](references/integration.md)** — installation, element inventory, code patterns.

## Mode 2 — Standalone HTML mockup (Claude.ai artifact, single-page demo, prototype)

You load two locally-bundled assets — `assets/{{name}}-standalone.css` and `assets/{{name}}-standalone.js`. No npm, no per-element imports, no remote CDN.

→ **[references/mockups.md](references/mockups.md)** — `<head>` boilerplate, local asset paths, available `l-*` tags.

## Per-element specs

For each element used, open **`references/<element>.md`** (e.g. `references/dialog.md`). Each file describes attributes, slots, events, and CSS custom properties.

## Available elements

{{elementsList}}
