/*
 * generate-readme-tables.mjs — generate the element table block in both READMEs.
 *
 * Reads packages/ui/dist/metadata/index.json (must be fresh — run `pnpm run metadata` first).
 * Updates the <!-- elements-table:start --> … <!-- elements-table:end --> blocks in:
 *   - packages/ui/README.md
 *   - README.md (repo root)
 *
 * Both files receive the IDENTICAL generated block.
 *
 * Modes:
 *   node scripts/generate-readme-tables.mjs --write   update both files in place
 *   node scripts/generate-readme-tables.mjs --check   exit 1 if either file is stale
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');

const META_PATH = resolve(PKG_ROOT, 'dist/metadata/index.json');
const README_PATHS = [resolve(PKG_ROOT, 'README.md'), resolve(REPO_ROOT, 'README.md')];

const START_MARKER = '<!-- elements-table:start -->';
const END_MARKER = '<!-- elements-table:end -->';

/**
 * Normalize a table block for semantic comparison:
 * - collapse whitespace around pipe characters on every line
 * - trim each line
 * - drop trailing empty lines
 * This makes the staleness check formatter-agnostic (oxfmt re-pads columns).
 *
 * @param {string} block
 * @returns {string}
 */
function normalize(block) {
  const lines = block.split('\n').map((line) => line.replace(/\s*\|\s*/g, '|').trim());
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines.join('\n');
}

const TYPE_LABELS = {
  native: '⏣ Native HTML Element',
  progressive: '⬡ Progressive Custom HTML Element',
  custom: '◇ Custom HTML Element (no Shadow DOM)',
  shadow: '⬢ Custom HTML Element (with Shadow DOM)',
};

function buildTableBlock(elements) {
  // Sort alphabetically by displayName
  const sorted = [...elements].toSorted((a, b) => a.displayName.localeCompare(b.displayName));

  const headers = { name: 'Name', tag: 'HTML tag', type: 'Type' };
  const cells = sorted.map((el) => ({
    name: el.displayName,
    tag: `\`<${el.tag ?? el.nativeTag ?? ''}>\``,
    type: TYPE_LABELS[el.type] ?? el.type,
  }));

  // Column widths grow to fit the longest entry, matching oxfmt's table
  // alignment — so the generated output stays formatter-clean as element names
  // and tags get longer.
  const width = (key) => Math.max(headers[key].length, ...cells.map((c) => c[key].length));
  const w = { name: width('name'), tag: width('tag'), type: width('type') };
  const row = (c) =>
    `| ${c.name.padEnd(w.name)} | ${c.tag.padEnd(w.tag)} | ${c.type.padEnd(w.type)} |`;

  const legend = [
    '_⏣ Native HTML Element · ⬡ Progressive Custom HTML Element · ◇ Custom HTML Element (no Shadow DOM) · ⬢ Custom HTML Element (with Shadow DOM)_',
  ].join('\n');

  const table = [
    row(headers),
    `| ${'-'.repeat(w.name)} | ${'-'.repeat(w.tag)} | ${'-'.repeat(w.type)} |`,
    ...cells.map(row),
  ].join('\n');

  return `${START_MARKER}\n\n${table}\n\n${legend}\n\n${END_MARKER}`;
}

function replaceBlock(content, newBlock) {
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers not found in file (looking for "${START_MARKER}" and "${END_MARKER}")`,
    );
  }

  return content.slice(0, startIdx) + newBlock + content.slice(endIdx + END_MARKER.length);
}

async function main() {
  const mode = process.argv[2];
  if (mode !== '--write' && mode !== '--check') {
    console.error('Usage: node scripts/generate-readme-tables.mjs --write | --check');
    process.exit(1);
  }

  const meta = JSON.parse(await readFile(META_PATH, 'utf-8'));
  const newBlock = buildTableBlock(meta.elements);

  let hasStale = false;

  for (const readmePath of README_PATHS) {
    const current = await readFile(readmePath, 'utf-8');

    const startIdx = current.indexOf(START_MARKER);
    const endIdx = current.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1) {
      console.error(`✖ ${readmePath}: markers not found.`);
      process.exit(1);
    }

    const existingBlock = current.slice(startIdx, endIdx + END_MARKER.length);

    if (normalize(existingBlock) === normalize(newBlock)) {
      if (mode === '--check') {
        console.log(`✓ ${readmePath} is up to date`);
      }
      continue;
    }

    if (mode === '--write') {
      const updated = replaceBlock(current, newBlock);
      await writeFile(readmePath, updated, 'utf-8');
      console.log(`✓ ${readmePath} updated`);
    } else {
      console.error(
        `✖ ${readmePath} is stale — run: node scripts/generate-readme-tables.mjs --write`,
      );
      hasStale = true;
    }
  }

  if (hasStale) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('generate-readme-tables failed:', err);
  process.exit(1);
});
