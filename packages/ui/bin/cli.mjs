#!/usr/bin/env node
/*
 * luxen-ui CLI — `import <noun>` copies a Luxen preset / piece into your
 * project as a customizable file. Take the wheel on any layer without forking.
 *
 *   npx luxen-ui import preset         → ./luxen-preset.css
 *   npx luxen-ui import tailwind       → ./luxen-tailwind.css
 *   npx luxen-ui import design-tokens  → ./luxen-design-tokens.css
 *
 * Mirrors the CSS `@import` you'll write next.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Registry of `import <noun>` recipes. */
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

function usage(code = 1) {
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

const [, , command, noun, destArg] = process.argv;

if (!command) usage(0);
if (command !== 'import') {
  console.error(`✗ Unknown command: ${command}`);
  usage();
}
if (!noun) {
  console.error('✗ Missing noun after `import`. Try: luxen-ui import preset');
  usage();
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
const relPath = relative(process.cwd(), destPath);

console.log(`✓ Created ${relPath}`);
console.log('');
for (const line of recipe.next(importPath)) console.log(line);
