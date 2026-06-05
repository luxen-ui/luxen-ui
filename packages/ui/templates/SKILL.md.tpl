---
name: {{name}}
description: >-
  {{description}}
compatibility: >-
  HTML + {{jsImportPath}} (npm) bundled with Vite or Webpack. Custom elements
  need the JS import; native elements need only their CSS @import.
metadata:
  source: luxen-ui
  source-version: "{{sourceVersion}}"
---

# {{displayName}}

A CSS-first web component library built on web standards. Most elements are plain CSS classes on native HTML; custom elements (like `<l-badge>`) use Lit with minimal Shadow DOM.

{{#mockups}}Two consumption modes — read the right reference file.

## Mode 1 — Integration (real application)

You import `{{name}}` from npm and bundle with Vite/Webpack. Code samples below use the `l-` prefix.

→ **[references/integration.md](references/integration.md)** — installation, element inventory, code patterns.

## Mode 2 — Standalone HTML mockup (Claude.ai artifact, single-page demo, prototype)

You load two locally-bundled assets — `assets/{{name}}-standalone.css` and `assets/{{name}}-standalone.js`. No npm, no per-element imports, no remote CDN.

→ **[references/mockups.md](references/mockups.md)** — `<head>` boilerplate, local asset paths, available `l-*` tags.
{{/mockups}}{{^mockups}}You import `{{name}}` from npm and bundle with Vite/Webpack. Code samples below use the `l-` prefix.

→ **[references/integration.md](references/integration.md)** — installation, element inventory, code patterns.
{{/mockups}}

## Conventions

These rules apply across all elements; element-specific detail lives in the per-element refs.

- **Custom elements need the JS import** (`import '{{jsImportPath}}';`). Native (CSS-class) elements need only their CSS `@import` — no JS. The element inventory in [references/integration.md](references/integration.md) marks which is which.
- **CSS is imported per element**, on top of the preset (`@import '{{cssImportPath}}/preset';`). Some elements ship **per-appearance** sub-imports — e.g. `@import '{{cssImportPath}}/close-button/ring';`.
- **Attribute conventions vary per element** — some take bare attributes (`<{{elementPrefix}}-badge variant="success">`), others use `data-*` (`<button class="{{cssPrefix}}-close" data-appearance="ring">`). Never guess; read the per-element spec first.
- **Variants and state use `data-*` attributes** (`data-variant`, `data-appearance`), not modifier classes.
- **Show/hide overlays with the invoker pattern**: `command="--show"` / `command="--hide"` + `commandfor="<id>"` for dialog and drawer.
- **Colors, spacing, and typography come from design tokens** — see [references/tokens.md](references/tokens.md). Use the semantic tokens and utility classes listed there rather than arbitrary values.

## Per-element specs

**ALWAYS read `references/<element>.md` before emitting that element** (e.g. `references/dialog.md`) — attribute conventions differ per element, so guessing from memory is unsafe. Each file describes attributes, slots, events, and CSS custom properties.

## Available elements

{{elementsList}}
