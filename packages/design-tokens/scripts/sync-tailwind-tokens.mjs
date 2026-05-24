#!/usr/bin/env node
/*
 * Re-syncs Luxen primitive tokens from Tailwind v4's theme.css.
 *
 * Scope:
 *   - color.json     : 26 families × 11 steps + white/black/transparent
 *   - radius.json    : Tailwind radius scale + Luxen-specific radius-full
 *   - text.json      : font-size + paired --line-height tokens
 *   - font-weight.json
 *   - tracking.json  : letter-spacing
 *   - leading.json   : line-height keywords
 *   - font.json      : font-family stacks + Luxen-specific neo-grotesque
 *
 * NOT regenerated (Luxen-authored only):
 *   - spacing.json   : Tailwind only ships `--spacing: 0.25rem`; the derived
 *                      `--spacing-N` scale is our calc-based authorship.
 *
 * Run after bumping the `tailwindcss` catalog entry.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PRIMITIVES_DIR = join(ROOT, 'src/tokens/1-primitives');

const require = (await import('node:module')).createRequire(import.meta.url);
const WORKSPACE = resolve(ROOT, '../..');
const tailwindPkg = require.resolve('tailwindcss/package.json', {
  paths: [join(WORKSPACE, 'packages/ui'), join(WORKSPACE, 'packages/docs'), WORKSPACE],
});
const themeCss = readFileSync(join(dirname(tailwindPkg), 'theme.css'), 'utf8');

function writeJson(filename, data) {
  const path = join(PRIMITIVES_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${filename}`);
}

/* ─────────────────────────── color ─────────────────────────── */

const COLOR_FAMILIES = [
  'amber',
  'blue',
  'cyan',
  'emerald',
  'fuchsia',
  'gray',
  'green',
  'indigo',
  'lime',
  'mauve',
  'mist',
  'neutral',
  'olive',
  'orange',
  'pink',
  'purple',
  'red',
  'rose',
  'sky',
  'slate',
  'stone',
  'taupe',
  'teal',
  'violet',
  'yellow',
  'zinc',
];
const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function syncColors() {
  const out = {
    $description:
      'Primitive color palette. Values vendored verbatim from Tailwind CSS v4 default theme. Update via scripts/sync-tailwind-tokens.mjs when bumping Tailwind.',
    color: {
      white: { $type: 'color', $value: '#ffffff' },
      black: { $type: 'color', $value: '#000000' },
      transparent: { $type: 'color', $value: 'transparent' },
    },
  };
  for (const family of COLOR_FAMILIES) {
    out.color[family] = {};
    for (const step of COLOR_STEPS) {
      const re = new RegExp(`--color-${family}-${step}:\\s*(oklch\\([^)]+\\));`);
      const m = themeCss.match(re);
      if (!m) throw new Error(`Missing --color-${family}-${step} in Tailwind theme.css`);
      out.color[family][String(step)] = { $type: 'color', $value: m[1] };
    }
  }
  writeJson('color.json', out);
}

/* ─────────────────────────── helpers ─────────────────────────── */

function extractScale(prefix, keys) {
  // Returns { [`${prefix}-${key}`]: value } using literal token names.
  const out = {};
  for (const key of keys) {
    // Tailwind ships some multi-line values (e.g. font-sans); match up to `;`.
    const re = new RegExp(`--${prefix}-${escapeRegex(key)}:\\s*([\\s\\S]+?);`);
    const m = themeCss.match(re);
    if (!m) throw new Error(`Missing --${prefix}-${key} in Tailwind theme.css`);
    out[`${prefix}-${key}`] = m[1].replace(/\s+/g, ' ').trim();
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ─────────────────────────── radius ─────────────────────────── */

function syncRadius() {
  const RADIUS_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
  const raw = extractScale('radius', RADIUS_KEYS);
  const out = {
    $description:
      'Border-radius primitives. Values vendored from Tailwind v4 default theme + `radius-full` (Luxen-specific pill shape). Update via scripts/sync-tailwind-tokens.mjs.',
    radius: { $type: 'dimension', $value: '0.25rem' },
  };
  for (const key of RADIUS_KEYS) {
    out[`radius-${key}`] = { $type: 'dimension', $value: raw[`radius-${key}`] };
  }
  out['radius-full'] = {
    $type: 'dimension',
    $value: 'calc(infinity * 1px)',
    $description:
      'Fully round border-radius for pill shapes, avatars, and circular elements. Luxen-specific — Tailwind v4 does not ship this.',
  };
  writeJson('radius.json', out);
}

/* ─────────────────────────── text (font-size + line-height) ─────────────────────────── */

function syncText() {
  const SIZES = [
    'xs',
    'sm',
    'base',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
    '7xl',
    '8xl',
    '9xl',
  ];
  const out = {
    $description:
      "Font-size primitives + paired line-height tokens. Vendored from Tailwind v4 default theme. Naming follows Tailwind's double-dash subkey convention: `--l-text-xs--line-height`.",
  };
  for (const size of SIZES) {
    const sizeRe = new RegExp(`--text-${size}:\\s*([^;]+);`);
    const lhRe = new RegExp(`--text-${size}--line-height:\\s*([^;]+);`);
    const sizeM = themeCss.match(sizeRe);
    const lhM = themeCss.match(lhRe);
    if (!sizeM) throw new Error(`Missing --text-${size}`);
    out[`text-${size}`] = { $type: 'dimension', $value: sizeM[1].trim() };
    if (lhM) {
      out[`text-${size}--line-height`] = { $type: 'dimension', $value: lhM[1].trim() };
    }
  }
  writeJson('text.json', out);
}

/* ─────────────────────────── font-weight ─────────────────────────── */

function syncFontWeight() {
  const WEIGHTS = [
    'thin',
    'extralight',
    'light',
    'normal',
    'medium',
    'semibold',
    'bold',
    'extrabold',
    'black',
  ];
  const out = { $description: 'Font-weight primitives. Vendored from Tailwind v4 default theme.' };
  for (const w of WEIGHTS) {
    const m = themeCss.match(new RegExp(`--font-weight-${w}:\\s*([^;]+);`));
    if (!m) throw new Error(`Missing --font-weight-${w}`);
    out[`font-weight-${w}`] = { $type: 'fontWeight', $value: m[1].trim() };
  }
  writeJson('font-weight.json', out);
}

/* ─────────────────────────── tracking (letter-spacing) ─────────────────────────── */

function syncTracking() {
  const TRACKS = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];
  const out = {
    $description:
      'Letter-spacing primitives. Vendored from Tailwind v4 default theme (`tracking-*` family).',
  };
  for (const t of TRACKS) {
    const m = themeCss.match(new RegExp(`--tracking-${t}:\\s*([^;]+);`));
    if (!m) throw new Error(`Missing --tracking-${t}`);
    out[`tracking-${t}`] = { $type: 'dimension', $value: m[1].trim() };
  }
  writeJson('tracking.json', out);
}

/* ─────────────────────────── leading (line-height keywords) ─────────────────────────── */

function syncLeading() {
  const LEAD = ['tight', 'snug', 'normal', 'relaxed', 'loose'];
  const out = {
    $description:
      'Line-height primitives. Vendored from Tailwind v4 default theme (`leading-*` family).',
  };
  for (const l of LEAD) {
    const m = themeCss.match(new RegExp(`--leading-${l}:\\s*([^;]+);`));
    if (!m) throw new Error(`Missing --leading-${l}`);
    out[`leading-${l}`] = { $type: 'number', $value: m[1].trim() };
  }
  writeJson('leading.json', out);
}

/* ─────────────────────────── font (family stacks) ─────────────────────────── */

function syncFont() {
  // Multi-line values: grab content between `--font-X:` and the next `;`.
  function grab(name) {
    const re = new RegExp(`--font-${name}:\\s*([\\s\\S]+?);`);
    const m = themeCss.match(re);
    if (!m) throw new Error(`Missing --font-${name}`);
    return m[1].replace(/\s+/g, ' ').trim();
  }
  const out = {
    $description:
      'Font-family primitives. `sans`, `serif`, `mono` vendored from Tailwind v4 defaults. `neo-grotesque` is a Luxen-specific stack used by the badge element; override per project.',
    'font-sans': { $type: 'fontFamily', $value: grab('sans') },
    'font-serif': { $type: 'fontFamily', $value: grab('serif') },
    'font-mono': { $type: 'fontFamily', $value: grab('mono') },
    'font-neo-grotesque': {
      $type: 'fontFamily',
      $value: 'Inter, ui-sans-serif, system-ui, sans-serif',
      $description:
        'Luxen-specific neo-grotesque stack (badge, labels). Override at :root to use a project font.',
    },
  };
  writeJson('font.json', out);
}

/* ─────────────────────────── run ─────────────────────────── */

syncColors();
syncRadius();
syncText();
syncFontWeight();
syncTracking();
syncLeading();
syncFont();
console.log('\n✓ All Tailwind-derived primitives synced.');
