# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luxen UI is a web component library monorepo built with:
- **Lit** for web components (Custom Elements v1)
- **Tailwind CSS** for styling via PostCSS
- **Vite** for building and development
- **VitePress** for documentation
- **Nx** for monorepo task orchestration
- **Yarn 4** (Berry) with workspaces

Component naming convention: All custom elements use the `l-` prefix (e.g., `<l-badge>`, `<l-tab-group>`).

## Monorepo Structure

The repository contains three packages under `packages/`:

1. **`@luxen-ui/css`** - Standalone CSS package
   - Builds modular CSS files using Vite
   - Uses PostCSS with autoprefixer and css-extras
   - Exports both bundled (`index.css`) and individual element stylesheets
   - Source: `src/`, includes design tokens and per-element CSS

2. **`@luxen-ui/elements`** - Web components library
   - TypeScript + Lit custom elements
   - Each component in `src/elements/<component-name>/<component-name>.ts`
   - Builds to dual outputs:
     - `dist/` - NPM package (ESM + types via vite-plugin-dts)
     - `cdn/` - CDN-ready individual modules (via second Vite config)
   - Generates `custom-elements.json` manifest via CEM analyzer
   - Uses TypeScript decorators (`experimentalDecorators: true`)

3. **`@luxen-ui/docs`** - VitePress documentation site
   - Depends on both `@luxen-ui/css` and `@luxen-ui/elements` via workspace protocol
   - Configuration: `packages/docs/.vitepress/config.js`
   - Content in `packages/docs/` (markdown files)

## Common Commands

### Building
```bash
# Build all packages (runs in parallel via Nx)
yarn build

# Build specific package
nx run @luxen-ui/css:build
nx run @luxen-ui/elements:build
nx run @luxen-ui/docs:build:docs
```

### Development
```bash
# CSS package (watch mode)
cd packages/css && yarn dev

# Elements package (Vite dev server)
cd packages/elements && yarn dev

# Docs (VitePress dev server)
cd packages/docs && yarn dev
```

### Linting & Formatting
```bash
# Lint all code (using oxlint - Rust-based fast linter)
yarn lint

# Format code (using oxfmt)
yarn format

# Check formatting without changes
yarn format:check
```

### Element-Specific Commands
```bash
# Generate custom elements manifest
cd packages/elements && yarn manifest
```

## Key Architecture Details

### CSS Package Build Process
- Vite scans `src/**/*.css` (excluding files starting with `_`)
- Each CSS file becomes a separate output in `dist/`
- Uses PostCSS transformer (not Lightning CSS) for compatibility
- Build supports watch mode via `WATCH=true` environment variable
- Can skip `emptyOutDir` via `DEV=true` for incremental builds

### Elements Package Build Process
- TypeScript compilation (`tsc`) runs first to generate types
- Vite builds the library with two separate outputs:
  1. Standard build → `dist/` (for NPM)
  2. Rollup with glob input → `cdn/` (for CDN, preserves directory structure)
- Custom Elements Manifest generated last via `cem analyze --litelement`
- Uses `@` alias pointing to `./src`
- Tailwind CSS included via `@tailwindcss/vite` plugin

### Web Component Pattern
Components follow this structure:
```typescript
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('l-component-name')
export class LuxenComponentName extends LitElement {
  // Component implementation
}

declare global {
  interface HTMLElementTagNameMap {
    'l-component-name': LuxenComponentName;
  }
}
```

Components document CSS custom properties via JSDoc `@cssproperty` tags for manifest generation.

### Dependency Flow
- `@luxen-ui/elements` depends on `lit` (external peer dependency)
- `@luxen-ui/docs` depends on both `@luxen-ui/css` and `@luxen-ui/elements` via `workspace:^`
- Nx handles build order via `dependsOn: ["^build"]` configuration

### Nx Configuration
- Build tasks are cached and have dependency ordering
- Lint tasks are cached
- Dev tasks are never cached
- Default base branch: `main`

## Development Requirements

- Node.js >= 22.x
- Yarn 4.1.0 (automatically used via `packageManager` field)
