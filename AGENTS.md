# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

Luxen UI is a web component library monorepo built with:

- **Lit** for web components (Custom Elements v1)
- **Tailwind CSS** for styling via PostCSS
- **Vite** for building and development
- **VitePress** for documentation
- **Vite+ (`vp run`)** for monorepo task orchestration
- **pnpm** with workspaces and `catalog:` protocol for centralized dependency versions

Component naming convention: custom elements use the `l-` prefix by default (e.g. `<l-badge>`, `<l-tabs>`). Consumers can rename it, so element source never hardcodes it.

## Where the rules live

This file covers the repository as a whole. Read the file that matches what you are changing:

| Working on                                      | Read                                  |
| ----------------------------------------------- | ------------------------------------- |
| Anything in `packages/ui`                       | `packages/ui/AGENTS.md`               |
| Element CSS                                     | `.claude/rules/element-css.md`        |
| Element TypeScript                              | `.claude/rules/element-ts.md`         |
| Tests in `packages/ui/tests`                    | `.claude/rules/element-tests.md`      |
| Anything in `packages/docs`                     | `packages/docs/AGENTS.md`             |
| The Accessibility section of a docs page        | `.claude/rules/docs-accessibility.md` |
| A page mockup that consumes `<l-*>` tags by CDN | `packages/ui/MOCKUPS.md`              |

Claude Code loads the `.claude/rules/` files automatically when it touches a matching path; other agents must open them.

## Monorepo Structure

The repository contains three packages under `packages/` and demo apps under `demos/`:

1. **`luxen-ui`** (`packages/ui`) - Unified CSS + web components package
   - CSS source in `src/css/` — token entry points, base styles, per-element CSS (flat files or appearance directories)
   - TypeScript + Lit custom elements in `src/html/elements/`
   - Shared base classes, controllers and styles in `src/html/shared/`
   - `elements.json` — the element registry (name and type of every element)
   - Builds to `dist/` (npm: ESM + types + CSS + metadata) and `cdn/` (CDN-ready modules)
   - Exports: `luxen-ui` (JS), `luxen-ui/css` (CSS bundle), `luxen-ui/css/*` (per-element CSS), `luxen-ui/css/element/appearance` (per-appearance CSS), `luxen-ui/*` (per-element JS), `luxen-ui/metadata` (element reference data)

2. **`@luxen-ui/docs`** (`packages/docs`) - VitePress documentation site
   - Depends on `luxen-ui` via workspace protocol
   - Configuration: `packages/docs/.vitepress/config.js`
   - Content in `packages/docs/` (markdown files) — also the source of the Agent Skill consumers generate

3. **`@luxen-ui/design-tokens`** (`packages/design-tokens`) - Standalone design-token distribution
   - CSS primitives, semantic aliases, palette, and an optional Tailwind bridge
   - Ships JSON and JS token formats alongside CSS custom properties
   - Consumed by `luxen-ui` as a workspace devDependency (tokens are inlined at build time, not shipped as a runtime dependency)

**Demo apps** live under `demos/` (e.g. `demos/nuxt` — a Nuxt integration example). They are included in the workspace glob but are not published packages.

## Common Commands

### Building

```bash
# Build all packages (recursive, cached, in dependency order)
vp run -r build

# Build specific package
vp run luxen-ui#build
vp run @luxen-ui/docs#build:docs
```

The `luxen-ui` build is one long chain (`packages/ui/package.json` → `build`): CSS, TypeScript, CDN bundles, then the element metadata and several **checks that fail the build** — metadata gaps, README element tables out of date, malformed docs Accessibility tables — and finally the skill templates. When a build fails, read which script failed before touching the code.

- CSS build scans `src/css/**/[^_]*.css` (files prefixed with `_` are partials) and uses the PostCSS transformer, not Lightning CSS.

### Development

```bash
# CSS watch mode
cd packages/ui && pnpm dev

# Elements (Vite dev server)
cd packages/ui && pnpm dev:elements

# Docs (VitePress dev server)
cd packages/docs && pnpm dev
```

### Checking & Testing

```bash
# Format, lint and type check
vp check

# All tests (Node unit tests + browser component tests)
vp run test

# From packages/ui: one runner at a time
pnpm test:unit
pnpm test:components
```

### Element-Specific Commands

```bash
# Regenerate the element metadata (manifest → dist/metadata) and validate it
cd packages/ui && pnpm run metadata
```

## Development Requirements

- Node.js >= 24.x
- pnpm (automatically used via `packageManager` field)

## Commits

Conventional commits, enforced by commitlint (`commitlint.config.js`):

- Scope, when given, is one of `css`, `elements`, `docs`, `deps`, `monorepo`, `ai`.
- Subject in lower case, including component and file names.

## Release Process

Releases are managed with [Changesets](https://github.com/changesets/changesets). A PR with user-facing impact must include a `.changeset/*.md` file. The `🦋 Changeset` CI job enforces it by PR title: it requires a changeset when the title type is `feat` or `fix`, and skips every other type (`docs`, `chore`, `test`, `refactor`…).

### Adding a changeset to a PR

```bash
vp run changeset
```

The CLI prompts: which packages changed → patch/minor/major → write a one-paragraph summary in **user-facing language** (not implementation detail). Commit the generated `.changeset/*.md` file with your code changes.

- **patch** — bug fix, no API change
- **minor** — new feature, backward-compatible
- **major** — breaking change

A PR with no user-facing impact (docs, CI, tests, internal refactor) takes no changeset: title it with a non-release type.

### How a release happens

1. PRs land on `main` with their changesets queued in `.changeset/`.
2. The `🚀 Release` workflow opens (or updates) a single rolling **`chore: release`** PR that consumes all queued changesets, bumps versions, and regenerates `packages/ui/CHANGELOG.md`.
3. Merging that PR triggers the same workflow again — this time it publishes to npm via `pnpm publish -r` and creates a GitHub Release.

The `pnpm publish -r` command is critical: it resolves `catalog:` and `workspace:` protocols into concrete versions in the published tarball. Never publish via `npm publish` directly (that's how `luxen-ui@0.1.0` shipped broken).

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
