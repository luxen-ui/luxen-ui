import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin, UserConfig } from 'vite';
import postcssPrefix from './postcss-plugin-prefix.js';

/**
 * Map of element base name → class name as exported by `luxen-ui/<name>/element`.
 *
 * Every custom element the library defines must appear here: an element absent
 * from this map emits no typing at all (`emitTypes` consumers get an untyped
 * `Element`), and an entry naming a class that isn't exported at
 * `<name>/element` emits an import with no file behind it. Neither is
 * observable at runtime, so `scripts/check-metadata.mjs` (check 6) validates
 * both directions against `dist/custom-elements.json` on every build — that is
 * why this map is exported. The same check ties each element back to
 * `ElementBaseName` in `src/html/registry.ts`, so all three stay in step.
 *
 * `toast-item` is deliberately absent: it is registered from `toast/index.ts`
 * and has no `dist/elements/toast-item/` module to import a type from.
 */
export const ELEMENT_CLASSES: Record<string, string> = {
  alert: 'Alert',
  'alert-dialog': 'AlertDialog',
  avatar: 'Avatar',
  badge: 'Badge',
  'button-group': 'ButtonGroup',
  carousel: 'Carousel',
  'carousel-item': 'CarouselItem',
  'color-scheme-icon': 'ColorSchemeIcon',
  combobox: 'Combobox',
  dialog: 'Dialog',
  divider: 'Divider',
  drawer: 'Drawer',
  dropdown: 'Dropdown',
  'dropdown-item': 'DropdownItem',
  'dropdown-label': 'DropdownLabel',
  'form-field': 'FormField',
  icon: 'Icon',
  'input-group': 'InputGroup',
  'input-otp': 'InputOtp',
  'input-stepper': 'InputStepper',
  popover: 'Popover',
  'prose-editor': 'ProseEditor',
  rating: 'Rating',
  'segmented-control': 'SegmentedControl',
  select: 'Select',
  skeleton: 'Skeleton',
  slider: 'Slider',
  spinner: 'Spinner',
  'sticky-bar': 'StickyBar',
  stories: 'LuxenStories',
  'stories-viewer': 'LuxenStoriesViewer',
  story: 'LuxenStory',
  tabs: 'Tabs',
  tag: 'Tag',
  toast: 'Toast',
  tooltip: 'Tooltip',
  tree: 'Tree',
  'tree-item': 'TreeItem',
};

const HEADER_MARKER = '// AUTO-GENERATED — prefix-aware element type map';

export interface EmitTypesOptions {
  /** Where to write the .d.ts (relative to the project root). */
  path: string;
  /**
   * Output flavour:
   * - `'dom'` (default) — augments `HTMLElementTagNameMap`. Right for plain
   *   DOM / vanilla TS and frameworks that read the global tag-name map.
   * - `'vue'` — additionally augments Vue's `GlobalComponents` so custom
   *   elements get strict prop/typo checking inside `.vue` templates. Requires
   *   `vueCompilerOptions.strictTemplates: true` in the consumer's tsconfig.
   */
  target?: 'dom' | 'vue';
  /** Subset of element base names. Defaults to all elements. */
  elements?: readonly string[];
  /**
   * Package specifier used in the generated `import` statements. Default
   * `'luxen-ui'`. Set this when you install the library under an npm alias
   * (e.g. `"pulse-ui": "npm:luxen-ui@^x"`) so the emitted imports resolve.
   */
  packageName?: string;
  /** Overwrite the file even when it exists. Default `false`. */
  force?: boolean;
}

export interface LuxenOptions {
  /** Custom element tag name prefix. Default `'l'`. */
  elementPrefix?: string;
  /** CSS class/token/keyframe prefix. Default `'l'`. */
  cssPrefix?: string;
  /**
   * Emit a project-local `.d.ts` that augments the type system with the
   * configured prefix so templates type-check. Pass a string for the default
   * behaviour (write once, never overwrite, `target: 'dom'`), or an object for
   * finer control. The file is written into the consumer's source tree —
   * commit it and edit freely.
   */
  emitTypes?: string | EmitTypesOptions;
  /**
   * Build-time defaults for the `luxen-ui/color-scheme` store, so a project
   * never has to call `colorScheme.configure()` from its entry point.
   */
  colorScheme?: ColorSchemeOptions;
}

/** Build-time defaults for `luxen-ui/color-scheme`. */
export interface ColorSchemeOptions {
  /**
   * `localStorage` key holding the light/dark override. Default
   * `'luxen-color-scheme'`; `''` disables persistence. The before-first-paint
   * snippet in your `<head>` must read the same key — it runs before any module
   * and cannot be rewritten by the build.
   */
  storageKey?: string;
  /** Have the store write `color-scheme` on `<html>` itself. Default `false`. */
  apply?: 'root' | false;
}

export default function luxen(options: LuxenOptions = {}): Plugin {
  let elementPrefix = 'l';
  let cssPrefix = 'l';
  let colorSchemeCfg: ColorSchemeOptions = {};
  /** What `bake` rewrites, filled in by `config` once the configuration is resolved. */
  let modules: BakedModule[] = [];

  /**
   * Bakes the configured values into the module `id` points at, by rewriting
   * its literal initialisers — no runtime `setPrefix()` or `configure()` call
   * needed in the consumer's entry point. Both stay exported for what the build
   * cannot know (tests, dynamic switching, a per-user key).
   *
   * Returns `null` when `id` is not one of `modules`, or nothing changes. Both
   * `transform` and the dependency optimizer (see `config`) run it.
   */
  function bake(code: string, id: string): string | null {
    const target = modules.find(({ path }) => path.test(id));
    // A path alone is not enough: plenty of packages ship a `dist/registry.js`.
    // Only Luxen's declares every initialiser, exactly as shipped.
    if (!target?.initialisers.every(([name, literal]) => initialiser(name, literal).test(code))) {
      return null;
    }

    let out = code;
    for (const [name, literal, value] of target.initialisers) {
      if (value !== undefined) out = bakeInitialiser(out, name, literal, value);
    }
    return out === code ? null : out;
  }

  return {
    name: 'luxen',

    async config() {
      // Plugin options take precedence; missing fields fall back to luxen.config.mjs
      // (same file consumed by `luxen-ui generate-skill`). Keeps prefixes in sync
      // between dev-time builds and skill generation without duplicating config.
      const fileCfg = await loadLuxenConfig();
      elementPrefix = options.elementPrefix ?? fileCfg?.elementPrefix ?? 'l';
      cssPrefix = options.cssPrefix ?? fileCfg?.cssPrefix ?? 'l';
      colorSchemeCfg = { ...fileCfg?.colorScheme, ...options.colorScheme };
      const emitTypes = options.emitTypes ?? fileCfg?.emitTypes;

      if (emitTypes) {
        const cfg: EmitTypesOptions =
          typeof emitTypes === 'string' ? { path: emitTypes } : emitTypes;
        syncTypesFile(elementPrefix, cfg);
      }

      const config: UserConfig = {};

      if (elementPrefix !== 'l' || cssPrefix !== 'l') {
        config.css = {
          postcss: {
            plugins: [postcssPrefix({ elementPrefix, cssPrefix })],
          },
        };
      }

      // Every value the plugin bakes, and the one place a new one is added:
      // `bake`, the optimizer's filter and its cache key all read this list.
      // `undefined` leaves an initialiser as shipped.
      modules = [
        bakedModule('registry', [
          ['_elementPrefix', "'l'", elementPrefix === 'l' ? undefined : elementPrefix],
          ['_cssPrefix', "'l'", cssPrefix === 'l' ? undefined : cssPrefix],
        ]),
        bakedModule('color-scheme', [
          ['_storageKey', "'luxen-color-scheme'", colorSchemeCfg.storageKey],
          ['_apply', 'false', colorSchemeCfg.apply],
        ]),
      ];

      const baked = modules.flatMap(({ file, initialisers }) =>
        initialisers
          .filter(([, , value]) => value !== undefined)
          .map(([name, , value]) => [file, name, value]),
      );

      // In `vite dev`, a `luxen-ui` installed from npm is pre-bundled into
      // `.vite/deps`, and Vite never runs `transform` over a pre-bundled
      // dependency: without this, dev would serve the defaults while the build
      // bakes the configuration in.
      if (baked.length > 0) {
        config.optimizeDeps = bakeInOptimizer(
          bake,
          modulePath(modules.map(({ file }) => file)),
          usesRolldown(this),
          hashOf(baked),
        );
      }

      return config;
    },

    transform(code, id) {
      const out = bake(code, id);
      return out === null ? null : { code: out, map: null };
    },
  };
}

/** `[name, literal it ships with, value to bake or undefined]`. */
type Initialiser = readonly [name: string, literal: string, value: unknown];

/** A module of the package whose literal initialisers the plugin rewrites. */
interface BakedModule {
  /** Its path inside the package without extension, e.g. `registry`. */
  file: string;
  /** Matches its id: see `modulePath`. */
  path: RegExp;
  initialisers: readonly Initialiser[];
}

function bakedModule(file: string, initialisers: readonly Initialiser[]): BakedModule {
  return { file, path: modulePath([file]), initialisers };
}

/**
 * Matches the ids of `files` by their path inside the package — compiled as
 * `dist/<file>.js`, or as `src/html/<file>.ts` for a project pointing at the
 * source — with or without a Vite query (`?used`, `?import`…).
 *
 * Never by the package's directory name: a linked install (workspace,
 * `npm link`, `file:`) resolves to wherever the package really sits, and an npm
 * alias installs it under another name. Both would go unbaked.
 *
 * Also the dependency optimizer's filter, so it stays valid for esbuild's Go
 * regular expressions: no lookaround, no backreference.
 */
function modulePath(files: readonly string[]): RegExp {
  const names = files.map((file) => file.split('/').map(escapeRegExp).join('[\\\\/]')).join('|');
  return new RegExp(
    `[\\\\/](?:dist[\\\\/](?:${names})\\.js|src[\\\\/]html[\\\\/](?:${names})\\.ts)(?:\\?.*)?$`,
  );
}

/**
 * Dependency-optimizer options that run `bake` over the modules `filter`
 * matches while Vite pre-bundles them: through Rolldown on Vite 8+, through
 * esbuild on Vite 5–7.
 *
 * `key` goes into the optimizer plugin's name on purpose. Vite keys its
 * `.vite/deps` cache on the names of the optimizer plugins, not on what they
 * do: with a fixed name, a project that edits `luxen.config.mjs` and restarts
 * would keep being served the previously baked values until it cleared the
 * cache by hand.
 */
function bakeInOptimizer(
  bake: (code: string, id: string) => string | null,
  filter: RegExp,
  rolldown: boolean,
  key: string,
): UserConfig['optimizeDeps'] {
  const name = `luxen:bake-deps-${key}`;

  if (rolldown) {
    return {
      rolldownOptions: {
        plugins: [
          {
            name,
            transform: {
              filter: { id: filter },
              handler(code, id) {
                const out = bake(code, id);
                return out === null ? null : { code: out, map: null };
              },
            },
          },
        ],
      },
    };
  }

  // Vite 8 still reads `esbuildOptions.plugins`, but warns that it is
  // deprecated: only older majors get here.
  return {
    esbuildOptions: {
      plugins: [
        {
          name,
          setup(build) {
            build.onLoad({ filter }, async ({ path }) => {
              const out = bake(await readFile(path, 'utf8'), path);
              if (out === null) return undefined;
              return { contents: out, loader: path.endsWith('.ts') ? 'ts' : 'js' };
            });
          },
        },
      ],
    },
  };
}

/**
 * Whether the running Vite pre-bundles with Rolldown (Vite 8+, and the
 * `rolldown-vite` package) rather than esbuild. Vite 8 says so in the `config`
 * hook's `this.meta`; Vite 7's `meta` has no `rolldownVersion`, and Vite 5 and
 * 6 call the hook with no `this` at all.
 */
function usesRolldown(context: unknown): boolean {
  const meta = (context as { meta?: { rolldownVersion?: unknown } } | undefined)?.meta;
  return typeof meta?.rolldownVersion === 'string';
}

function hashOf(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 8);
}

/**
 * Matches `<name>[: Type] = <literal>;`.
 *
 * The optional type annotation is what makes this a helper rather than a plain
 * pattern: the module resolves to the compiled `let _apply = false;` in `dist`,
 * but to `let _apply: ColorSchemeApply = false;` when a project points at the
 * TypeScript source — which `modulePath` accepts. A pattern that only matched
 * the compiled shape would drop half a project's configuration there, silently
 * and with no build error.
 */
function initialiser(name: string, literal: string, flags = ''): RegExp {
  return new RegExp(
    `\\b${escapeRegExp(name)}(\\s*:\\s*[\\w.<>|'" ]+?)? = ${escapeRegExp(literal)};`,
    flags,
  );
}

/**
 * Rewrite every `<name>[: Type] = <literal>;` to hold `value`, written as a
 * JSON literal and through a replacer function, so no character in `value` can
 * end the string early or read as a `$&`-style replacement pattern.
 */
function bakeInitialiser(code: string, name: string, literal: string, value: unknown): string {
  return code.replace(
    initialiser(name, literal, 'g'),
    (_match, annotation: string | undefined) =>
      `${name}${annotation ?? ''} = ${JSON.stringify(value)};`,
  );
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Loads `luxen.config.mjs` (or `.js`) from the current working directory, if
 * present. Returns the partial config or `null` if no file is found.
 *
 * This is the same file consumed by `luxen-ui generate-skill` — keeping a
 * single source of truth for prefixes avoids drift between dev-time CSS/JS
 * rebranding and skill generation.
 */
async function loadLuxenConfig(): Promise<Partial<LuxenOptions> | null> {
  const candidates = [
    resolve(process.cwd(), 'luxen.config.mjs'),
    resolve(process.cwd(), 'luxen.config.js'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        // eslint-disable-next-line no-await-in-loop -- early-return on first match
        const mod = await import(pathToFileURL(p).href);
        return (mod.default ?? mod) as Partial<LuxenOptions>;
      } catch (err) {
        console.warn(`[luxen] failed to load ${p}:`, (err as Error).message);
        return null;
      }
    }
  }
  return null;
}

function syncTypesFile(prefix: string, cfg: EmitTypesOptions): void {
  const target = resolve(process.cwd(), cfg.path);
  const names = cfg.elements ?? Object.keys(ELEMENT_CLASSES);
  // Own-property lookup, not `in`: a hand-written `elements` subset is consumer
  // input, and `'toString' in ELEMENT_CLASSES` is true — the prototype chain
  // would smuggle `Object`'s own members into the emitted file. (`Object.hasOwn`
  // would read better but is ES2022; this file compiles against `lib: ES2020`.)
  const isElement = (n: string): boolean =>
    Object.prototype.hasOwnProperty.call(ELEMENT_CLASSES, n);

  const unknown = names.filter((n) => !isElement(n));
  if (unknown.length > 0) {
    console.warn(`[luxen] emitTypes: unknown element(s) ignored — ${unknown.join(', ')}`);
  }

  const known = names.filter(isElement);
  const pkg = cfg.packageName || 'luxen-ui';
  const content =
    cfg.target === 'vue'
      ? renderVueTypesFile(prefix, known, pkg)
      : renderTypesFile(prefix, known, pkg);

  if (existsSync(target)) {
    if (cfg.force) {
      writeFileSync(target, content, 'utf8');
      console.log(`[luxen] rewrote ${cfg.path} (force: true)`);
      return;
    }
    // Drift check: only flag files we previously wrote (signed with the marker).
    const current = readFileSync(target, 'utf8');
    if (current.includes(HEADER_MARKER) && !current.includes(`'${prefix}-`)) {
      console.warn(
        `[luxen] ${cfg.path} was generated for a different prefix than '${prefix}-*' — pass emitTypes: { path, force: true } to regenerate.`,
      );
    }
    return;
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, 'utf8');
  console.log(`[luxen] wrote ${cfg.path} — commit this file.`);
}

function renderTypesFile(prefix: string, names: readonly string[], pkg: string): string {
  const sorted = [...names];
  sorted.sort();
  const imports = sorted
    .map((n) => `import type { ${ELEMENT_CLASSES[n]} } from '${pkg}/${n}/element';`)
    .join('\n');
  const entries = sorted.map((n) => `    '${prefix}-${n}': ${ELEMENT_CLASSES[n]};`).join('\n');
  const reexports = sorted.map((n) => ELEMENT_CLASSES[n]).join(', ');

  return `${HEADER_MARKER}
// Generated by '${pkg}/vite-plugin' (emitTypes). You own this file — edit,
// drop elements you don't use, or regenerate by deleting it and re-running
// the dev/build command.

${imports}

declare global {
  interface HTMLElementTagNameMap {
${entries}
  }
}

export type { ${reexports} };
`;
}

function renderVueTypesFile(prefix: string, names: readonly string[], pkg: string): string {
  const sorted = [...names];
  sorted.sort();
  const imports = sorted
    .map((n) => `import type { ${ELEMENT_CLASSES[n]} } from '${pkg}/${n}/element';`)
    .join('\n');
  const domEntries = sorted.map((n) => `    '${prefix}-${n}': ${ELEMENT_CLASSES[n]};`).join('\n');
  const vueEntries = sorted
    .map((n) => `    '${prefix}-${n}': DefineComponent<ElementProps<${ELEMENT_CLASSES[n]}>>;`)
    .join('\n');
  const reexports = sorted.map((n) => ELEMENT_CLASSES[n]).join(', ');

  return `${HEADER_MARKER} (vue)
// Generated by '${pkg}/vite-plugin' (emitTypes, target: 'vue'). You own this
// file — edit, drop elements you don't use, or regenerate by deleting it.
//
// Requires \`vueCompilerOptions.strictTemplates: true\` in your tsconfig for
// unknown-attribute / bad-value detection inside templates.

import type { DefineComponent } from 'vue';
import type { LuxenElement } from '${pkg}/luxen-element';
${imports}

// Keep only each element's OWN settable data props: subtract everything
// inherited from LuxenElement / Lit / HTMLElement, drop methods, and drop
// read-only members — get-only accessors (\`validity\`, \`willValidate\`) and
// \`readonly\` fields (\`_internals\`) are element state a template cannot set,
// and several elements inherit a stack of them from the form-associated base.
// Any \`on*\` listener stays allowed. Autocomplete lands on the real props while
// unknown attributes and bad values still error.
type Writable<T, K extends keyof T> = (<G>() => G extends { [P in K]: T[K] } ? 1 : 2) extends
  <G>() => G extends { -readonly [P in K]: T[K] } ? 1 : 2
  ? K
  : never;
type OwnKeys<T> = {
  [K in keyof T]-?: K extends keyof LuxenElement
    ? never
    : T[K] extends (...args: never[]) => unknown
      ? never
      : Writable<T, K>;
}[keyof T];
type ElementProps<T> = Partial<Pick<T, OwnKeys<T>>> &
  Record<\`on\${string}\`, ((event: Event) => void) | undefined>;

declare global {
  interface HTMLElementTagNameMap {
${domEntries}
  }
}

declare module 'vue' {
  // Native elements feed web components via \`slot=""\` and carry \`data-*\`
  // hooks; keep them valid under strictTemplates.
  interface HTMLAttributes {
    slot?: string;
    [key: \`data-\${string}\`]: unknown;
  }

  interface GlobalComponents {
${vueEntries}
  }
}

export type { ${reexports} };
`;
}
