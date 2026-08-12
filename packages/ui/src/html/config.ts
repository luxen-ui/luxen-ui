/**
 * Shared types for `luxen.config.mjs` — consumed by both `luxen-ui/vite-plugin`
 * (dev / build) and `luxen-ui generate-skill` (AI skill folder).
 *
 * Wrap your config in `defineConfig({...})` to get autocompletion and type
 * checking inside `luxen.config.mjs` without writing TypeScript:
 *
 *   ```js
 *   // luxen.config.mjs
 *   import { defineConfig } from 'luxen-ui';
 *
 *   export default defineConfig({
 *     elementPrefix: 'pulse',
 *     cssPrefix: 'p',
 *     // ← editor autocompletes every field below
 *   });
 *   ```
 *
 * Each field is consumed by one or both tools; comments mark which.
 */

/** Per-element subset for `emitTypes.elements`. */
export type LuxenElementBaseName = string;

/** Detailed options for the Vite plugin's `emitTypes` feature. */
export interface LuxenEmitTypesConfig {
  /** Where to write the declaration file, relative to the project root. */
  path: string;
  /**
   * Output flavour:
   * - `'dom'` (default) — augments `HTMLElementTagNameMap`.
   * - `'vue'` — additionally augments Vue's `GlobalComponents` for strict
   *   prop/typo checking inside `.vue` templates (requires
   *   `vueCompilerOptions.strictTemplates`).
   */
  target?: 'dom' | 'vue';
  /** Subset of element base names. Defaults to all elements. */
  elements?: readonly LuxenElementBaseName[];
  /**
   * Package specifier used in the emitted imports. Default `'luxen-ui'`. Set
   * this when you install the library under an npm alias (e.g.
   * `"pulse-ui": "npm:luxen-ui@^x"`).
   */
  packageName?: string;
  /** Overwrite the file even when it exists. Default `false`. */
  force?: boolean;
}

/** Build-time defaults for the `luxen-ui/color-scheme` store. */
export interface LuxenColorSchemeConfig {
  /**
   * `localStorage` key holding the light/dark override. Default
   * `'luxen-color-scheme'`. Set to `''` to disable persistence entirely.
   *
   * Change it here and the before-first-paint snippet in your `<head>` has to
   * read the same key — that snippet runs before any module and cannot be
   * rewritten by the build.
   */
  storageKey?: string;
  /**
   * Have the store write `color-scheme` on `<html>` itself. Default `false`,
   * because most applications already own a color-mode story; `'root'` is the
   * batteries-included path for a plain page.
   */
  apply?: 'root' | false;
}

/**
 * Shape of `luxen.config.mjs`. Both the Vite plugin and the CLI read this
 * file; each tool ignores the fields that don't apply to it.
 */
export interface LuxenConfig {
  // ── Identity — CLI (`generate-skill`) only ─────────────────────────────────
  /** Skill name (kebab-case). Becomes the folder name + `name` frontmatter. */
  name?: string;
  /** Display name shown in headings and prose (e.g. `'Pulse'`). */
  displayName?: string;
  /** Skill description for the `SKILL.md` frontmatter. */
  description?: string;

  // ── Prefixes — read by BOTH the Vite plugin and the CLI ────────────────────
  /** Tag prefix without trailing dash. Default `'l'`. */
  elementPrefix?: string;
  /** CSS class / custom property / keyframe prefix without trailing dash. Default `'l'`. */
  cssPrefix?: string;

  // ── Skill output — CLI only ────────────────────────────────────────────────
  /** Path to a CSS file with brand-token overrides; appended to the bundle. */
  themeCss?: string;
  /** Output dir for the skill folder. Default `.claude/skills/<name>/`. */
  out?: string;
  /** npm specifier used in `@import` examples in `references/`. Default `'luxen-ui/css'`. */
  cssImportPath?: string;
  /** npm specifier used in `import` examples in `references/`. Default `'luxen-ui'`. */
  jsImportPath?: string;

  // ── Color scheme — Vite plugin only ────────────────────────────────────────
  /**
   * Defaults for `luxen-ui/color-scheme`, baked in at build time so a project
   * never has to call `colorScheme.configure()` from its entry point.
   */
  colorScheme?: LuxenColorSchemeConfig;

  // ── Dev tooling — Vite plugin only ─────────────────────────────────────────
  /**
   * Emit a prefix-aware `.d.ts` for `HTMLElementTagNameMap` (and optionally
   * Vue's `GlobalComponents`). Pass a path string for the default behaviour,
   * or an options object for finer control.
   */
  emitTypes?: string | LuxenEmitTypesConfig;
}

/**
 * Identity helper that returns the config unchanged. Wrap your config in
 * `defineConfig(...)` so editors infer field names and types from
 * {@link LuxenConfig} — no need to rename the file to `.ts`.
 */
export function defineConfig<T extends LuxenConfig>(config: T): T {
  return config;
}
