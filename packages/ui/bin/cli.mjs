#!/usr/bin/env node
/*
 * luxen-ui CLI — two subcommands:
 *
 *   import <noun>     Copy a CSS preset / token file into the project for
 *                     customization (see IMPORTABLES below).
 *
 *   generate-skill    Produce an Agent Skill folder named after your design
 *                     system, with prefix and brand tokens already applied.
 *                     Output is meant to be committed to your repo (e.g.
 *                     `.claude/skills/<name>/`).
 *
 * Run `luxen-ui --help` for usage.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_VERSION = JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf-8')).version;

// =============================================================================
//  `import <noun>` — copies a Luxen preset / piece into your project.
// =============================================================================

const IMPORTABLES = {
  preset: {
    source: resolve(PKG_ROOT, 'dist/css/preset.css'),
    defaultDest: './luxen-preset.css',
    next: (importPath) => [
      'Next steps:',
      '  1. In your CSS entry, replace',
      "         @import 'luxen-ui/css/preset';",
      '     with',
      `         @import '${importPath}';`,
      '',
      '  2. Edit the file freely — swap any layer for your own',
      '     implementation, or import atomic pieces directly:',
      "         @import 'luxen-ui/css/base';            /* runtime only */",
      "         @import '@my-ds/colors';                /* your palette */",
      "         @import 'luxen-ui/css/tokens/aliases';  /* semantic aliases */",
    ],
  },
  tailwind: {
    source: resolve(PKG_ROOT, 'dist/css/tailwind/preset.css'),
    defaultDest: './luxen-tailwind.css',
    next: (importPath) => [
      'Next steps:',
      '  1. In your CSS entry, replace',
      "         @import 'luxen-ui/tailwind/preset';",
      '     with',
      `         @import '${importPath}';`,
      '',
      '  2. Uncomment any extended Tailwind palette families you want to use.',
      '',
      '  3. Add project-specific tokens (brand colors, custom fonts, etc.)',
      '     in the same file — they coexist with Luxen tokens.',
    ],
  },
  'design-tokens': {
    source: resolve(PKG_ROOT, 'dist/css/tokens/aliases.css'),
    defaultDest: './luxen-design-tokens.css',
    next: (importPath) => [
      'Next steps:',
      '  1. In your CSS entry, replace',
      "         @import 'luxen-ui/css/tokens/aliases';",
      "     or @import 'luxen-ui/css/preset';   (if you used the preset)",
      '     with the new ordering:',
      "         @import 'luxen-ui/css/base';",
      "         @import 'luxen-ui/css/tokens/primitives';   /* or your own */",
      `         @import '${importPath}';`,
      '',
      '  2. Edit ./luxen-design-tokens.css — every semantic alias is yours to',
      '     repurpose (text-primary, bg-fill-brand, focus-ring, …).',
      '',
      '  3. Tokens reference primitives via `var(--l-color-*)`. Either keep the',
      '     Luxen primitives, or remap them (e.g. to Radix UI colors) above this',
      '     import so the aliases pick up your palette.',
    ],
  },
};

function cmdImport([noun, destArg]) {
  if (!noun) {
    console.error('✗ Missing noun after `import`. Try: luxen-ui import preset');
    usageImport(1);
  }
  const recipe = IMPORTABLES[noun];
  if (!recipe) {
    console.error(`✗ Don't know how to import "${noun}".`);
    console.error(`  Available: ${Object.keys(IMPORTABLES).join(', ')}`);
    process.exit(1);
  }

  const dest = destArg ?? recipe.defaultDest;
  const destPath = resolve(process.cwd(), dest);

  if (existsSync(destPath)) {
    console.error(`✗ ${dest} already exists. Move it aside or pass a different path.`);
    process.exit(1);
  }
  if (!existsSync(recipe.source)) {
    console.error(`✗ Source not found at ${recipe.source}.`);
    console.error('  Did luxen-ui finish installing? Try re-running install.');
    process.exit(1);
  }

  const content = readFileSync(recipe.source, 'utf8');
  writeFileSync(destPath, content, 'utf8');

  const importPath = dest.startsWith('.') || dest.startsWith('/') ? dest : `./${dest}`;
  console.log(`✓ Created ${relative(process.cwd(), destPath)}`);
  console.log('');
  for (const line of recipe.next(importPath)) console.log(line);
}

// =============================================================================
//  `generate-skill` — produce a brand-aware Agent Skill folder.
// =============================================================================

const DEFAULT_CONFIG = {
  name: 'luxen-ui',
  displayName: 'Luxen UI',
  description:
    'Generate UI with Luxen UI, a CSS-first web component library. Provides CSS classes for native HTML elements and custom elements (l-badge, l-dialog, l-toast). Use when building interfaces with Luxen UI.',
  // Prefixes use the Vite plugin convention: bare identifier without trailing
  // dash. `elementPrefix: 'pulse'` means tags are `<pulse-badge>`, type selectors
  // are `pulse-badge`. `cssPrefix: 'pulse'` controls `.pulse-button` classes,
  // `--pulse-*` custom properties, and `@keyframes pulse-*`.
  elementPrefix: 'l',
  cssPrefix: 'l',
  cssImportPath: 'luxen-ui/css',
  jsImportPath: 'luxen-ui',
  themeCss: null,
  out: null,
};

async function cmdGenerateSkill(args) {
  const opts = parseFlags(args);
  const config = await loadConfig(opts.config);
  const ctx = buildContext(config, opts);

  await runGenerateSkill(ctx);

  console.log(`✓ Skill generated at ${relative(process.cwd(), ctx.outDir)}`);
  console.log('');
  console.log('Next steps:');
  console.log(`  • Commit ${ctx.outDir} so AI agents (and the rest of your team) can read it.`);
  console.log(`  • Re-run \`luxen-ui generate-skill\` whenever luxen-ui or your tokens change.`);
}

function parseFlags(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--config') opts.config = argv[++i];
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--element-prefix') opts.elementPrefix = argv[++i];
    else if (arg === '--css-prefix') opts.cssPrefix = argv[++i];
    else if (arg === '--name') opts.name = argv[++i];
    else if (arg === '--theme-css') opts.themeCss = argv[++i];
    else if (arg === '-h' || arg === '--help') usageGenerateSkill(0);
    else {
      console.error(`✗ Unknown flag: ${arg}`);
      usageGenerateSkill(1);
    }
  }
  return opts;
}

async function loadConfig(configPath) {
  const candidates = configPath
    ? [resolve(process.cwd(), configPath)]
    : [resolve(process.cwd(), 'luxen.config.mjs'), resolve(process.cwd(), 'luxen.config.js')];
  for (const p of candidates) {
    if (existsSync(p)) {
      // eslint-disable-next-line no-await-in-loop -- early-return on first match, max 2 candidates
      const mod = await import(pathToFileURL(p).href);
      return mod.default ?? mod;
    }
  }
  if (configPath) {
    console.error(`✗ Config file not found: ${configPath}`);
    process.exit(1);
  }
  return {};
}

function buildContext(config, opts) {
  const merged = { ...DEFAULT_CONFIG, ...config, ...stripUndefined(opts) };
  // Sanity: prefixes must NOT end with a dash (matches Vite plugin convention).
  for (const k of ['elementPrefix', 'cssPrefix']) {
    if (merged[k].endsWith('-')) {
      console.error(
        `✗ Invalid ${k} "${merged[k]}" — drop the trailing dash (e.g. "pulse", not "pulse-").`,
      );
      process.exit(1);
    }
  }
  const outDir = resolve(process.cwd(), merged.out ?? `.claude/skills/${merged.name}`);
  return {
    ...merged,
    outDir,
    pkgRoot: PKG_ROOT,
    sourceVersion: PKG_VERSION,
  };
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// --- Pipeline -----------------------------------------------------------------

async function runGenerateSkill(ctx) {
  ensureDir(ctx.outDir);
  ensureDir(join(ctx.outDir, 'references'));
  ensureDir(join(ctx.outDir, 'assets'));
  ensureDir(join(ctx.outDir, 'assets', 'css'));

  // 1. Read templates (hand-written) and pre-transformed element docs (build).
  const tplDir = resolve(ctx.pkgRoot, 'templates');
  const distTplDir = resolve(ctx.pkgRoot, 'dist/templates');

  if (!existsSync(distTplDir)) {
    console.error(`✗ Missing ${distTplDir}.`);
    console.error("  This directory is generated by luxen-ui's build. Reinstall the package.");
    process.exit(1);
  }

  const elements = JSON.parse(readFileSync(resolve(ctx.pkgRoot, 'elements.json'), 'utf-8'));
  const skillElements = elements.elements.filter((e) => e.inSkill);

  // 2. Compute template variables.
  const vars = {
    name: ctx.name,
    displayName: ctx.displayName,
    description: ctx.description.trim().replace(/\s+/g, ' '),
    elementPrefix: ctx.elementPrefix,
    cssPrefix: ctx.cssPrefix,
    sourceVersion: ctx.sourceVersion,
    cdnVersion: ctx.sourceVersion.split('.').slice(0, 2).join('.'),
    cssImportPath: ctx.cssImportPath,
    jsImportPath: ctx.jsImportPath,
    elementsTable: buildElementsTable(skillElements, ctx),
    elementsList: buildElementsList(skillElements),
    tagsList: buildTagsList(elements.elements),
  };

  // 3. Render SKILL.md, integration.md, claude-design.md
  await renderTemplate(join(tplDir, 'SKILL.md.tpl'), join(ctx.outDir, 'SKILL.md'), vars, ctx);
  await renderTemplate(
    join(tplDir, 'integration.md.tpl'),
    join(ctx.outDir, 'references', 'integration.md'),
    vars,
    ctx,
  );
  await renderTemplate(
    join(tplDir, 'claude-design.md.tpl'),
    join(ctx.outDir, 'assets', 'claude-design.md'),
    vars,
    ctx,
  );

  // 4. Per-element references (with prefix + package-name substitution).
  for (const el of skillElements) {
    const src = join(distTplDir, 'elements', `${el.name}.md`);
    const dst = join(ctx.outDir, 'references', `${el.name}.md`);
    const content = readFileSync(src, 'utf-8');
    const out = applyPackageName(applyPrefix(content, ctx), ctx);
    writeFileSync(dst, out, 'utf-8');
  }

  // 5. mockups.md — rendered from template (local-assets paths, prefix-aware
  // since assets/cdn/ has been substituted to the consumer's prefix).
  await renderTemplate(
    join(tplDir, 'mockups.md.tpl'),
    join(ctx.outDir, 'references', 'mockups.md'),
    vars,
    ctx,
  );

  // 6. Standalone runtime bundle for mockup mode (assets/<name>-standalone.{js,css}).
  // Two files instead of a 150-file tree: one <link> + one <script> in any
  // mockup HTML loads the full library with the consumer's prefix and tokens.
  const standaloneJsSrc = resolve(ctx.pkgRoot, 'cdn/standalone.js');
  const standaloneCssSrc = resolve(ctx.pkgRoot, 'cdn/standalone.css');
  if (!existsSync(standaloneJsSrc) || !existsSync(standaloneCssSrc)) {
    console.error(
      `✗ cdn/standalone.{js,css} not found in ${ctx.pkgRoot}. Run \`pnpm build:standalone\` in luxen-ui first.`,
    );
    process.exit(1);
  }
  const jsDst = join(ctx.outDir, 'assets', `${ctx.name}-standalone.js`);
  const cssDst = join(ctx.outDir, 'assets', `${ctx.name}-standalone.css`);
  writeFileSync(
    jsDst,
    applyPackageName(applyPrefixJs(readFileSync(standaloneJsSrc, 'utf-8'), ctx), ctx),
    'utf-8',
  );
  writeFileSync(
    cssDst,
    applyPackageName(applyPrefixCss(readFileSync(standaloneCssSrc, 'utf-8'), ctx), ctx),
    'utf-8',
  );

  // 7. Optional theme override CSS — appended to the standalone CSS so it
  // overrides Luxen's default tokens. The consumer authored the file, so we
  // copy verbatim without prefix substitution.
  if (ctx.themeCss) {
    const themePath = resolve(process.cwd(), ctx.themeCss);
    if (!existsSync(themePath)) {
      console.error(`✗ themeCss not found: ${ctx.themeCss}`);
      process.exit(1);
    }
    const themeContent = readFileSync(themePath, 'utf-8');
    writeFileSync(
      cssDst,
      readFileSync(cssDst, 'utf-8') + '\n\n/* Theme overrides */\n' + themeContent,
      'utf-8',
    );
  }
}

// --- Helpers ------------------------------------------------------------------

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

async function renderTemplate(srcPath, dstPath, vars, ctx) {
  const raw = readFileSync(srcPath, 'utf-8');
  const withVars = applyMustache(raw, vars);
  const withPrefix = applyPrefix(withVars, ctx);
  const final = applyPackageName(withPrefix, ctx);
  writeFileSync(dstPath, final, 'utf-8');
}

function applyMustache(content, vars) {
  return content.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

// Substitutes the npm package name `luxen-ui` with the consumer's name in
// quoted import paths — covers both `'luxen-ui'` (bare) and `'luxen-ui/...'`
// (sub-paths like `'luxen-ui/css/badge'`). The strict patterns (quote + exact
// name) avoid false positives on unrelated identifiers like
// `Symbol.for('luxen-dialog-scroll-lock')` (no closing quote on `luxen-ui`,
// continues with other text).
function applyPackageName(content, ctx) {
  const pkg = ctx.jsImportPath;
  if (pkg === 'luxen-ui') return content;
  return content
    .replace(/'luxen-ui'/g, `'${pkg}'`)
    .replace(/"luxen-ui"/g, `"${pkg}"`)
    .replace(/'luxen-ui\//g, `'${pkg}/`)
    .replace(/"luxen-ui\//g, `"${pkg}/`);
}

// Prefix substitution for markdown / generic text. Patterns are split by
// surface: tag-shaped patterns use elementPrefix (matching the Vite plugin's
// elementPrefix and registry.js), CSS-shaped patterns use cssPrefix (matching
// postcss-plugin-prefix). Quoted forms (e.g. `'l-'`) default to elementPrefix
// because they overwhelmingly refer to tag names in JS strings / JSON. When
// elementPrefix === 'l' and cssPrefix === 'l', this is a no-op.
function applyPrefix(content, ctx) {
  const { elementPrefix: e, cssPrefix: c } = ctx;
  if (e === 'l' && c === 'l') return content;
  return content
    .replace(/<l-/g, `<${e}-`)
    .replace(/<\/l-/g, `</${e}-`)
    .replace(/--l-/g, `--${c}-`)
    .replace(/\.l-/g, `.${c}-`)
    .replace(/"l-/g, `"${e}-`)
    .replace(/'l-/g, `'${e}-`)
    .replace(/`l-/g, `\`${e}-`)
    .replace(/ l-/g, ` ${e}-`)
    .replace(/\(l-/g, `(${e}-`)
    .replace(/\[l-/g, `[${e}-`)
    .replace(/,l-/g, `,${e}-`)
    .replace(/=l-/g, `=${e}-`)
    .replace(/\nl-/g, `\n${e}-`);
}

// Prefix substitution for CSS files. Three surfaces, two prefixes (mirrors
// postcss-plugin-prefix):
//   - CSS variables  `--l-*`  → cssPrefix
//   - Class selectors `.l-*`  → cssPrefix
//   - Type selectors  `l-foo { ... }`, `l-foo:hover`, `, l-foo`  → elementPrefix
// The type-selector pattern matches `l-` only at positions where a CSS selector
// can start (line start, whitespace, comma, combinators), to avoid touching the
// `l-` inside `--l-`, `.l-`, `--prefix-l-something`, etc.
function applyPrefixCss(content, ctx) {
  const { elementPrefix: e, cssPrefix: c } = ctx;
  if (e === 'l' && c === 'l') return content;
  return content
    .replace(/--l-/g, `--${c}-`)
    .replace(/\.l-/g, `.${c}-`)
    .replace(/(^|[\s,>+~(])l-/gm, `$1${e}-`);
}

// Prefix substitution for the standalone JS bundle: registry initialisers,
// tag-name string literals, shadow-DOM CSS inlined as JS strings, and (if
// included) custom-elements.json. The bundle is built unminified so these
// patterns are stable.
function applyPrefixJs(content, ctx) {
  const { elementPrefix: e, cssPrefix: c } = ctx;
  if (e === 'l' && c === 'l') return content;
  return (
    content
      .replace(/'l-/g, `'${e}-`)
      .replace(/"l-/g, `"${e}-`)
      .replace(/--l-/g, `--${c}-`)
      // Registry initialisers — match the standalone bundle's unminified form:
      //   var _elementPrefix = "l";  →  var _elementPrefix = "pulse";
      //   var _cssPrefix = "l";      →  var _cssPrefix = "p";
      .replace(/_elementPrefix = "l"/g, `_elementPrefix = "${e}"`)
      .replace(/_cssPrefix = "l"/g, `_cssPrefix = "${c}"`)
  );
}

function buildElementsTable(elements, ctx) {
  const lines = [
    '| Element | Type | Selector | Reference |',
    '|---------|------|----------|-----------|',
  ];
  for (const e of elements) {
    const type = e.kind === 'native' ? 'CSS class' : 'Custom element';
    // CSS classes use cssPrefix; custom elements use elementPrefix.
    const prefix = e.kind === 'native' ? ctx.cssPrefix : ctx.elementPrefix;
    const sel =
      e.selector ?? (e.kind === 'native' ? `.${prefix}-${e.name}` : `<${prefix}-${e.name}>`);
    // Selector overrides (e.g. `.l-close`) need manual prefix swap. Choose the
    // right prefix based on the leading character (`<` = tag, `.` = class).
    const finalSel = e.selector
      ? e.selector.replace(/^([<.])l-/, (_, ch) =>
          ch === '<' ? `<${ctx.elementPrefix}-` : `.${ctx.cssPrefix}-`,
        )
      : sel;
    lines.push(`| ${e.displayName} | ${type} | \`${finalSel}\` | [${e.name}.md](${e.name}.md) |`);
  }
  return lines.join('\n');
}

function buildElementsList(elements) {
  return elements.map((e) => e.displayName).join(', ') + '.';
}

// Builds the comma-separated `l-foo` tag list for mockups.md (from manifest
// entries flagged `inMockups`, excluding native CSS-only elements). The result
// is processed by applyPrefix at render time, so the tags reflect the consumer's
// rebrand if any.
function buildTagsList(allElements) {
  return (
    allElements
      .filter((e) => e.inMockups && e.kind !== 'native')
      .map((e) => `\`l-${e.name}\``)
      .join(', ') + '.'
  );
}

// =============================================================================
//  Command dispatcher
// =============================================================================

function usageImport(code = 1) {
  console.error('Usage: luxen-ui import <noun> [path]');
  console.error('');
  console.error('Available nouns:');
  console.error('  preset            Import the CSS preset (base + tokens).');
  console.error('                    Default: ./luxen-preset.css');
  console.error('  tailwind          Import the Tailwind theme preset (bridge).');
  console.error('                    Default: ./luxen-tailwind.css');
  console.error('  design-tokens     Import the semantic aliases for customization.');
  console.error('                    Default: ./luxen-design-tokens.css');
  process.exit(code);
}

function usageGenerateSkill(code = 1) {
  console.error('Usage: luxen-ui generate-skill [flags]');
  console.error('');
  console.error('Flags:');
  console.error('  --config <path>           Config file (default: ./luxen.config.mjs)');
  console.error('  --name <name>             Skill name (default: luxen-ui)');
  console.error('  --element-prefix <p>      Tag prefix without trailing dash (default: l)');
  console.error(
    '  --css-prefix <p>          CSS class/var prefix without trailing dash (default: l)',
  );
  console.error('  --theme-css <path>        Optional CSS file with token overrides');
  console.error('  --out <path>              Output dir (default: .claude/skills/<name>)');
  console.error('');
  console.error('Config file (luxen.config.mjs) takes the same keys, plus identity:');
  console.error('  export default {');
  console.error("    name: 'pulse',");
  console.error("    displayName: 'Pulse',");
  console.error("    description: '...',");
  console.error("    elementPrefix: 'pulse',");
  console.error("    cssPrefix: 'pulse',");
  console.error("    themeCss: 'src/styles/tokens.css',");
  console.error("    out: '.claude/skills/pulse',");
  console.error('  }');
  console.error('');
  console.error('The Vite plugin (luxen-ui/vite-plugin) reads the same file —');
  console.error('keep elementPrefix/cssPrefix in sync between dev and skill generation.');
  process.exit(code);
}

function usage(code = 1) {
  console.error('Usage: luxen-ui <command> [args]');
  console.error('');
  console.error('Commands:');
  console.error('  import <noun> [path]  Copy a CSS preset / token file into the project.');
  console.error('  generate-skill        Produce a brand-aware Agent Skill folder.');
  console.error('');
  console.error('Run `luxen-ui <command> --help` for command-specific flags.');
  process.exit(code);
}

const [, , command, ...rest] = process.argv;

if (!command || command === '-h' || command === '--help') usage(0);

if (command === 'import') cmdImport(rest);
else if (command === 'generate-skill') await cmdGenerateSkill(rest);
else {
  console.error(`✗ Unknown command: ${command}`);
  usage(1);
}
