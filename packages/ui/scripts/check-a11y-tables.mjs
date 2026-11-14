#!/usr/bin/env node
// Checks every <AccessibilityTable> against .claude/rules/docs-accessibility.md.
//
//   node packages/ui/scripts/check-a11y-tables.mjs            → status of every page
//   node packages/ui/scripts/check-a11y-tables.mjs tabs badge → check these pages, exit 1 on error
//   node packages/ui/scripts/check-a11y-tables.mjs --strict   → every page must pass (run by `build`)
//
// It only catches what is mechanical (shape, wording tells, links). Whether a
// row is in the right group, or true, still needs a reader.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACCESSIBILITY_TABLE, readAccessibilityTable } from './a11y-table.mjs';

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '../../docs');
const DIRS = ['elements', 'foundations', 'forms'];

const MAX_TITLE = 48;
// Counted after `vp check --fix`, which puts one attribute per line.
const MAX_SNIPPET_LINES = 8;

// Topic labels: they name a subject instead of stating something.
const LABELS = new Set(
  [
    'role',
    'roles',
    'accessible name',
    'accessible description',
    'focus',
    'focus management',
    'focus restoration',
    'focus order',
    'focus visible',
    'focus ring',
    'motion',
    'reduced motion',
    'color',
    'colour',
    'contrast',
    'color contrast',
    'non-text contrast',
    'keyboard',
    'target size',
    'size',
    'icon',
    'state',
    'structure',
    'landmark',
    'live region',
    'order',
    'orientation',
    'headings',
    'validation',
    'description',
  ].map((s) => s.toLowerCase()),
);
const LABEL_SUFFIX =
  /\b(state|name|management|restoration|role|region|purpose|integration|policy)$/i;

// Wording that gives away a consumer obligation sitting in `:data`.
const OBLIGATION = /\b(must|needs?|requires?|should|consumer|make sure|ensure)\b/i;
// "Group" is left out: it opens fact titles too ("Group named from `label`").
const IMPERATIVE = /^(provide|set|add|wrap|pair|keep|use|put|give|write|do not|don[’']t)\b/i;
const FILLER = /^(always|never)\b/i;

const REF = /\[([^\]]+)\]\(([^)]+)\)/g;
const REF_LABEL = /^(WCAG|RGAA) \d+(\.\d+)+$/;
const REF_URL = {
  WCAG: 'https://www.w3.org/WAI/WCAG22/Understanding/',
  RGAA: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#',
};
// A named reference that should be a link when it appears as bare text.
const NAMED_REFERENCE = /\b(APG|WAI-ARIA Authoring Practices|ARIA Authoring Practices)\b/;

const withoutLinks = (s) => s.replace(REF, '');

function resolvePage(arg) {
  const candidates = [
    arg,
    `${arg}.md`,
    ...DIRS.flatMap((d) => [join(d, arg), join(d, `${arg}.md`)]),
  ];
  const hit = candidates
    .map((c) => join(docsRoot, c))
    .find((p) => existsSync(p) && p.endsWith('.md'));
  if (!hit) throw new Error(`No docs page matches "${arg}"`);
  return hit;
}

function allPages() {
  return DIRS.flatMap((d) =>
    existsSync(join(docsRoot, d))
      ? readdirSync(join(docsRoot, d))
          .filter((f) => f.endsWith('.md'))
          .map((f) => join(docsRoot, d, f))
      : [],
  ).filter((p) => readFileSync(p, 'utf8').includes('<AccessibilityTable'));
}

function checkRow(row, group, slots, problems) {
  const where = `${group} "${row.Check ?? '?'}"`;
  const fail = (msg) => problems.push(`${where}: ${msg}`);

  if (!row.Check) return fail('missing `Check`');
  const title = row.Check.trim();
  const plain = title.replace(/`/g, '');

  if (plain.length > MAX_TITLE) fail(`title is ${plain.length} characters, ${MAX_TITLE} at most`);
  if (/[.:]$/.test(title)) fail('title ends with punctuation');
  if (plain.split(/\s+/).length < 2) {
    fail('one-word title — write an instruction (Your part) or a fact (Built in)');
  } else if (
    LABELS.has(plain.toLowerCase()) ||
    LABEL_SUFFIX.test(title.replace(/`[^`]*`/g, '').trim())
  ) {
    fail('title is a topic label — write an instruction (Your part) or a fact (Built in)');
  }
  if (group === 'rules' && FILLER.test(plain)) fail('drop "Always" / turn "Never" into "Don’t"');

  for (const field of ['Description', 'Note']) {
    const text = row[field];
    if (text === undefined) continue;
    if (!text.trim()) fail(`empty \`${field}\` — omit it`);
    if (text.trim().endsWith('.')) fail(`\`${field}\` ends with a period`);
    if (NAMED_REFERENCE.test(withoutLinks(text)))
      fail(`\`${field}\` names a reference without linking it`);
  }
  if (
    row.Description &&
    row.Description.replace(/`/g, '').trim().toLowerCase() === plain.toLowerCase()
  ) {
    fail('`Description` restates the title — omit it');
  }

  if (group === 'data') {
    const text = `${plain} ${row.Description ?? ''}`;
    if (OBLIGATION.test(text) || IMPERATIVE.test(row.Description ?? '') || IMPERATIVE.test(plain)) {
      fail('reads as a consumer obligation — move it to `:rules` (or reword it as a fact)');
    }
    if (/\bautomatically\b|^native\b/i.test(plain)) {
      fail(
        'title states the mechanism — state what the cited criterion checks ("Dialog role exposed")',
      );
    }
    if (row.Code) fail('`Code` is for `:rules` rows only');
  }

  if (row.WCAG) {
    const refs = [...row.WCAG.matchAll(REF)];
    if (!refs.length) fail('`WCAG` holds no `[WCAG 1.4.3](url)` link');
    for (const [, label, url] of refs) {
      if (!REF_LABEL.test(label)) fail(`reference "${label}" is not "WCAG n.n.n" / "RGAA n.n"`);
      else if (!url.startsWith(REF_URL[label.split(' ')[0]]))
        fail(`reference "${label}" has an unexpected URL`);
    }
  }

  if (row.Code) {
    const slot = slots.get(row.Code);
    if (!slot) return fail(`no \`<template #${row.Code}>\` slot with a fenced block`);
    slot.used = true;
    const lines = slot.code.trimEnd().split('\n').length;
    if (!slot.lang) fail(`snippet "${row.Code}" has no language on its fence`);
    if (lines > MAX_SNIPPET_LINES)
      fail(`snippet "${row.Code}" is ${lines} lines, ${MAX_SNIPPET_LINES} at most`);
  }
}

function checkPage(path) {
  const src = readFileSync(path, 'utf8');
  const problems = [];
  let legacy = 0;
  let rows = 0;

  const tables = [...src.matchAll(ACCESSIBILITY_TABLE)];
  const expected = (src.match(/<AccessibilityTable/g) ?? []).length;
  if (tables.length !== expected)
    problems.push(
      'table: could not parse — check quotes and the `:data` / `:rules` / `:references` order',
    );

  for (const [raw, dataSrc, rulesSrc, slotsSrc] of tables) {
    if (raw.includes('\\"')) problems.push('table: escaped `\\"` found — write `&quot;`');

    let table;
    try {
      table = readAccessibilityTable(dataSrc, rulesSrc, slotsSrc);
    } catch (error) {
      problems.push(`table: ${error.message}`);
      continue;
    }
    const { data, rules, slots } = table;

    for (const row of data) checkRow(row, 'data', slots, problems);
    for (const rule of rules) {
      if (typeof rule === 'string') legacy++;
      else checkRow(rule, 'rules', slots, problems);
    }
    rows += data.length + rules.length;

    const titles = (list) => list.filter((r) => r?.Check).map((r) => r.Check.toLowerCase());
    const dupes = titles(data).filter((t) => titles(rules).includes(t));
    for (const t of dupes) problems.push(`"${t}": same title in both groups`);
    for (const [name, slot] of slots)
      if (!slot.used) problems.push(`slot "#${name}" is not used by any row`);
  }

  return { path: relative(docsRoot, path), problems, legacy, rows };
}

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const named = args.filter((a) => !a.startsWith('--'));
const results = (named.length ? named.map(resolvePage) : allPages()).map(checkPage);

let failed = 0;
for (const { path, problems, legacy, rows } of results) {
  const migrated = legacy === 0;
  const ok = migrated && problems.length === 0;
  if (!ok) failed++;

  if (named.length || strict) {
    console.log(`${ok ? '✓' : '✗'} ${path} — ${rows} rows`);
    if (legacy)
      console.log(`    ${legacy} plain-string rule(s): turn each into a { Check, … } row`);
    for (const p of problems) console.log(`    ${p}`);
  } else {
    const status = ok ? '✓ done   ' : migrated ? '✗ errors ' : '· to do  ';
    console.log(`${status} ${path}${problems.length ? ` (${problems.length} problems)` : ''}`);
  }
}

console.log(`\n${results.length - failed}/${results.length} pages pass`);
if ((named.length || strict) && failed) process.exit(1);
