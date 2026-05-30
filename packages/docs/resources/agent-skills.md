# Agent Skills

Luxen UI ships a CLI that generates an [Agent Skill](https://agentskills.io/) tailored to your project — same name as your design system, same prefix, same brand tokens. AI assistants (Claude Code, Cursor, others that support the spec) read the skill to produce accurate Luxen UI code on the first try.

::: info WHY GENERATE PER-PROJECT?
A pre-built skill can only describe the default — `l-` prefix, Luxen colors. If you rebrand the prefix (e.g. to `pulse-`) or override brand tokens, the skill must reflect _your_ project, not the canonical defaults. The CLI does that in one command.
:::

## Generate the skill

After installing `luxen-ui`, run:

```bash
npx luxen-ui generate-skill
```

Default output (no config): `.claude/skills/luxen-ui/` with `l-` prefix and Luxen tokens, **integration mode only**.

::: info MOCKUP MODE IS OPT-IN
By default the skill targets **integration** (npm + bundler, read by Claude Code / Cursor). The standalone bundle and mockup docs — used only for [Claude Design](#claude-design-claude-ai-design-environment) and single-page HTML artifacts — add ~1.7 MB of committed files, so they're skipped unless you ask for them. Pass `--with-mockups` (or set `mockups: true` in the config) to include them.
:::

To customize, drop a `luxen.config.mjs` in your project root:

```js
// luxen.config.mjs — single source of truth for the CLI *and* the Vite plugin.
// Each field is consumed by one or both tools — the comments mark which.
// Wrap in defineConfig() for editor autocompletion / type-checking.
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  // Skill identity — used by `generate-skill` CLI only (Vite plugin doesn't
  // care about display names: it just rebrands code at build time).
  name: 'pulse', // skill folder name + SKILL.md `name` frontmatter
  displayName: 'Pulse', // heading + branding in generated docs
  description: 'Pulse design system — CSS-first web components for Pulse apps.',

  // Prefixes — used by BOTH the CLI and the Vite plugin (no trailing dash).
  elementPrefix: 'pulse', // <pulse-badge>, type selector pulse-badge
  cssPrefix: 'p', // .p-button, --p-color-*, @keyframes p-*

  // Skill-generation knobs — CLI only. The Vite plugin ignores these because
  // they describe where to write the skill folder and which theme tokens to
  // bundle into it — concerns specific to skill output, not dev/build.
  mockups: true, // optional: also emit the standalone bundle + mockup/Claude Design docs (off by default)
  themeCss: 'src/styles/design-tokens.css', // optional: appended to <name>-standalone.css (requires mockups)
  out: '.claude/skills/pulse', // where the skill folder is written

  // Dev-tooling output — Vite plugin only. The CLI ignores this; it's the
  // plugin's responsibility to emit a prefix-aware `.d.ts` for your IDE.
  emitTypes: 'types/pulse.d.ts',
});
```

The same file is read by the [Vite plugin](https://github.com/luxen-ui/luxen-ui/blob/main/packages/ui/vite-plugin.ts) when no plugin options are passed — keeping `elementPrefix`/`cssPrefix` in sync between dev-time CSS/JS rebranding and skill generation. Plugin options passed at the call site take precedence over the file.

### CLI-only fields explained

**`mockups`** — _optional, default `false`._ When `true` (or with the `--with-mockups` flag), the CLI also emits the standalone bundle (`assets/<name>-standalone.{js,css}`), `assets/claude-design.md`, `references/mockups.md`, and the "Mode 2" section of `SKILL.md`. These power [Claude Design](#claude-design-claude-ai-design-environment) and single-page HTML artifacts. Left off, the skill is integration-only and ~1.7 MB lighter to commit.

**`themeCss`** — _optional._ Path to a CSS file containing your brand-token overrides (e.g. brand colour, radius, typography). When set, its contents are appended to the generated `<name>-standalone.css`, after the Luxen defaults — so any `:root { --pulse-color-brand-primary: …; }` you write there overrides the built-in token of the same name. Typically you produce this file once with `npx luxen-ui import design-tokens` and edit it. If omitted, mockups render with the Luxen defaults. **Requires `mockups`** — without it there's no standalone bundle to theme, and the CLI warns and ignores it.

```css
/* src/styles/design-tokens.css — example */
:root {
  --pulse-color-brand-primary: oklch(0.62 0.21 268);
  --pulse-radius-md: 10px;
}
```

**`out`** — output directory for the generated skill folder, relative to the project root. Default `.claude/skills/<name>/`. Commit this folder so AI agents (Claude Code, Cursor, Claude Design projects, etc.) and your team can read it without running the CLI themselves. Re-run the CLI after a `luxen-ui` bump or a token change to refresh it.

Then re-run:

```bash
npx luxen-ui generate-skill
```

Output structure (per [Agent Skills spec](https://agentskills.io/specification)):

```
.claude/skills/<name>/
├── SKILL.md                       ← entry point (router; "Mode 2" section only with --with-mockups)
├── assets/                        ← --with-mockups only
│   ├── claude-design.md           ← workflow template for Claude Design projects
│   ├── <name>-standalone.css      ← all CSS in one file: tokens + base + every element
│   └── <name>-standalone.js       ← all JS in one file: registers every element with your prefix
└── references/
    ├── integration.md             ← integration-mode guide + element inventory
    ├── mockups.md                 ← --with-mockups only: HTML boilerplate using the standalone assets
    └── <element>.md               ← per-element specs (attributes, slots, events)
```

The `assets/` folder and `references/mockups.md` appear only when you pass `--with-mockups`; the default skill is integration-only.

**Commit the output.** AI agents — and your team — read it as a regular folder. Re-run the CLI whenever you bump `luxen-ui` or change your token overrides.

## How to use the generated skill

### Claude Code

Once the folder is committed, Claude Code discovers `.claude/skills/<name>/SKILL.md` automatically (or run `npx skills add ./.claude/skills/<name>` for explicit registration).

### Claude Design (Claude.ai design environment)

Claude Design is the Claude.ai project environment for design / HTML mockups. Upload your generated skill folder into a Claude Design project, alongside a root `CLAUDE.md` derived from the bundled workflow template.

**Expected layout under `Design System > Design Files`:**

```
┌──────────────────┐ ┌──────────────────┐
│  Design System   │ │  Design Files  ✓ │
└──────────────────┘ └──────────────────┘

 project

 FOLDERS ─────────────────────────────────────
  <name>/                              Folder

 DOCUMENTS ───────────────────────────────────
  CLAUDE.md                          Document
```

The `<name>/` folder contains the full uploaded skill (`SKILL.md`, `assets/`, `references/`). `CLAUDE.md` at the root is the workflow file — its content is exactly `<name>/assets/claude-design.md`.

**Steps:**

1. Run `npx luxen-ui generate-skill --with-mockups` locally with your config. The `--with-mockups` flag is required here — Claude Design needs the standalone bundle and `assets/claude-design.md`, which the default (integration-only) skill omits.
2. Upload the generated `<name>/` folder into your Claude Design project (drag the folder, or zip + ask Claude Design to unzip).
3. Create a `CLAUDE.md` at the project root with the exact content of `<name>/assets/claude-design.md`.

Mockups attached to this Design System automatically read the uploaded files — no per-conversation prompt needed.

Re-run the CLI and re-upload after a `luxen-ui` bump or a token change.

### Other tools

Any tool that supports the [Agent Skills specification](https://agentskills.io/specification) can use the generated folder. For tools that don't, paste the contents of `SKILL.md` into your system prompt.
