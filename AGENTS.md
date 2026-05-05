# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luxen UI is a web component library monorepo built with:

- **Lit** for web components (Custom Elements v1)
- **Tailwind CSS** for styling via PostCSS
- **Vite** for building and development
- **VitePress** for documentation
- **Vite+ (`vp run`)** for monorepo task orchestration
- **pnpm** with workspaces and `catalog:` protocol for centralized dependency versions

Component naming convention: All custom elements use the `l-` prefix (e.g., `<l-badge>`, `<l-tab-group>`).

## Designing UI mockups with this library

If you're an AI assistant composing page mockups (e.g. in a Claude.ai artifact) that consume `<l-*>` tags, read [`MOCKUPS.md`](./MOCKUPS.md). It contains the CDN-loading template that turns `l-*` tags into real custom elements rather than styled unknown elements.

## Monorepo Structure

The repository contains two packages under `packages/`:

1. **`luxen-ui`** (`packages/ui`) - Unified CSS + web components package
   - CSS source in `src/css/` — design tokens, base styles, per-element CSS (flat files or appearance directories)
   - TypeScript + Lit custom elements in `src/html/elements/`
   - Shared controllers in `src/html/controllers/`
   - Builds modular CSS files using Vite (`vite.config.css.ts`)
   - Builds JS to dual outputs:
     - `dist/` - NPM package (ESM + types via `tsc`)
     - `cdn/` - CDN-ready individual modules (via `vite.config.ts`)
   - CSS output in `dist/css/`
   - Generates `custom-elements.json` manifest via CEM analyzer
   - Uses TypeScript decorators (`experimentalDecorators: true`)
   - Exports: `luxen-ui` (JS), `luxen-ui/css` (CSS bundle), `luxen-ui/css/*` (per-element CSS), `luxen-ui/css/element/appearance` (per-appearance CSS), `luxen-ui/*` (per-element JS)

2. **`@luxen-ui/docs`** (`packages/docs`) - VitePress documentation site
   - Depends on `luxen-ui` via workspace protocol
   - Configuration: `packages/docs/.vitepress/config.js`
   - Content in `packages/docs/` (markdown files)

## Common Commands

### Building

```bash
# Build all packages (recursive via vp run)
vp run -r build

# Build specific package
vp run luxen-ui#build
vp run @luxen-ui/docs#build:docs
```

### Development

```bash
# CSS watch mode
cd packages/ui && pnpm dev

# Elements (Vite dev server)
cd packages/ui && pnpm dev:elements

# Docs (VitePress dev server)
cd packages/docs && pnpm dev
```

### Linting & Formatting

```bash
# Lint all code (using oxlint - Rust-based fast linter)
pnpm lint

# Format code (using oxfmt)
pnpm format

# Check formatting without changes
pnpm format:check
```

### Element-Specific Commands

```bash
# Generate custom elements manifest
cd packages/ui && pnpm run manifest
```

## Key Architecture Details

### Build Process

The `luxen-ui` package has a multi-step build:

1. **CSS build** (`vite build --config vite.config.css.ts`) — scans `src/css/**/[^_]*.css` (excluding `_` prefixed), outputs to `dist/css/`
2. **TypeScript compilation** (`tsc`) — generates JS + types in `dist/`
3. **CDN build** (`vite build`) — Rollup with glob input, outputs to `cdn/`
4. **Manifest** (`cem analyze --litelement`) — generates `custom-elements.json`
5. **Skill generation** (`node scripts/generate-skill.mjs`) — generates Agent Skill docs

- Uses PostCSS transformer (not Lightning CSS) for CSS
- CSS build supports watch mode via `WATCH=true` environment variable
- Uses `@` alias pointing to `./src`

### Web Component Pattern

Components follow this structure:

```typescript
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('l-component-name')
export class ComponentName extends LitElement {
  // Component implementation
}

declare global {
  interface HTMLElementTagNameMap {
    'l-component-name': ComponentName;
  }
}
```

Components document CSS custom properties via JSDoc `@cssproperty` tags for manifest generation.

### Dependency Flow

- `luxen-ui` depends on `lit` and `@floating-ui/dom`
- `@luxen-ui/docs` depends on `luxen-ui` via `workspace:^`
- `vp run -r` handles build order via the workspace dependency graph

### Task Runner Configuration

- `vp run -r --cache build` runs builds across all workspace packages with caching
- Use `vp run <package>#<task>` to target a specific package

## Development Requirements

- Node.js >= 24.x
- pnpm (automatically used via `packageManager` field)

## Release Process

Releases are managed with [Changesets](https://github.com/changesets/changesets). Each PR with user-facing impact must include a `.changeset/*.md` file. The `🦋 Changeset` CI job fails the PR otherwise.

### Adding a changeset to a PR

```bash
vp run changeset
```

The CLI prompts: which packages changed → patch/minor/major → write a one-paragraph summary in **user-facing language** (not implementation detail). Commit the generated `.changeset/*.md` file with your code changes.

- **patch** — bug fix, no API change
- **minor** — new feature, backward-compatible
- **major** — breaking change

For PRs with no user-facing impact (docs, CI, internal refactor), create an empty changeset:

```bash
vp run changeset --empty
```

### How a release happens

1. PRs land on `main` with their changesets queued in `.changeset/`.
2. The `🚀 Release` workflow opens (or updates) a single rolling **`chore: release`** PR that consumes all queued changesets, bumps versions, and regenerates `packages/ui/CHANGELOG.md`.
3. Merging that PR triggers the same workflow again — this time it publishes to npm via `pnpm publish -r` and creates a GitHub Release.

The `pnpm publish -r` command is critical: it resolves `catalog:` and `workspace:` protocols into concrete versions in the published tarball. Never publish via `npm publish` directly (that's how `luxen-ui@0.1.0` shipped broken).

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ built-in commands (`vp dev`, `vp build`, `vp test`, etc.) always run the Vite+ built-in tool, not any `package.json` script of the same name. To run a custom script that shares a name with a built-in command, use `vp run <script>`. For example, if you have a custom `dev` script that runs multiple services concurrently, run it with `vp run dev`, not `vp dev` (which always starts Vite's dev server).
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## CI Integration

For GitHub Actions, consider using [`voidzero-dev/setup-vp`](https://github.com/voidzero-dev/setup-vp) to replace separate `actions/setup-node`, package-manager setup, cache, and install steps with a single action.

```yaml
- uses: voidzero-dev/setup-vp@v1
  with:
    cache: true
- run: vp check
- run: vp test
```

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
