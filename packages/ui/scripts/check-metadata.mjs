/*
 * check-metadata.mjs — CI guard for the generated element metadata.
 *
 * Runs after normalize-metadata.mjs. Fails the build (exit 1) when the metadata
 * the docs and the generated AI skill rely on is incomplete or mis-referenced.
 * Catches the regressions that bit us during the metadata migration:
 *
 *   1. An `inSkill` element with no `summary`.
 *   2. A public CSS custom property with no description.
 *   3. A native `inSkill` element with no `<name>.meta.ts` sidecar.
 *   4. A doc `<ApiTable element="x" section="y" />` whose element is unknown,
 *      whose section name is invalid, or whose section resolves to an EMPTY
 *      array (the section would render blank — i.e. a mis-route or a real gap).
 *   5. A doc `<ElementSpec element="x" />` whose element is unknown.
 *   6. An element the Vite plugin's `emitTypes` cannot type — missing from
 *      `ELEMENT_CLASSES`, mapped to a class the manifest doesn't declare, or
 *      missing from `ElementBaseName` in `src/html/registry.ts`.
 *   7. A doc whose `## API reference` headings are out of the canonical order,
 *      misspelled, or labelled differently from the table they hold.
 *   8. A documented element with custom states (`@cssstate`) whose docs never
 *      render its `cssStates` table: the states would be silently missing.
 *
 * Usage: node scripts/check-metadata.mjs   (exit 0 = pass, 1 = problems)
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Type-stripped by Node, which needs >= 24 for that to be on by default — the
// repo's root package.json pins `engines.node` to `>=24.x` and CI runs 24. The
// plugin ships as TypeScript source and `tsconfig.tooling.json` is `noEmit`, so
// there is no compiled copy to read; importing the source also keeps
// `pnpm run metadata` working on a tree that never ran the tooling build.
import { ELEMENT_CLASSES } from '../vite-plugin.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const META_PATH = resolve(PKG_ROOT, 'dist/metadata/index.json');
const MANIFEST_PATH = resolve(PKG_ROOT, 'dist/custom-elements.json');
const REGISTRY_PATH = resolve(PKG_ROOT, 'elements.json');
const ELEMENTS_SRC = resolve(PKG_ROOT, 'src/html/elements');
const REGISTRY_SRC = resolve(PKG_ROOT, 'src/html/registry.ts');
const DOCS_DIR = resolve(PKG_ROOT, '..', 'docs', 'elements');

const VALID_SECTIONS = new Set([
  'properties',
  'attributes',
  'events',
  'methods',
  'slots',
  'cssClasses',
  'cssParts',
  'cssStates',
  'cssProperties',
  'commands',
  'examples',
]);

// 7: the `## API reference` section of every element doc lists its `###`
// headings in one canonical order — the HTML/JS API first, then the CSS API —
// so every page reads the same way. A sub-element's sections (headed
// "`dropdown-item` Slots") come after the main element's, in the same order,
// and every metadata table sits under the heading of its own element and
// section. A heading not in the list (e.g. `ToastOptions`, the options object
// of `toast()`) is a companion of the section right above it: it is not ranked
// and may only hold inline `:data` tables, never metadata-driven ones.
const API_SECTION_ORDER = [
  ['Importing', []],
  ['Attributes & Properties', ['properties', 'attributes']],
  ['Methods', ['methods']],
  ['Commands', ['commands']],
  ['Events', ['events']],
  ['Slots', ['slots']],
  ['CSS parts', ['cssParts']],
  ['Custom states', ['cssStates']],
  ['CSS classes', ['cssClasses']],
  ['CSS custom properties', ['cssProperties']],
];
const API_SECTION_NAMES = API_SECTION_ORDER.map(([name]) => name);
const API_SECTION_DATA = new Map(API_SECTION_ORDER);
// Lowercased spellings → canonical heading, so "CSS Parts" or "Properties" is
// reported as a misspelling instead of slipping through as a companion.
const API_SECTION_SPELLINGS = new Map([
  ...API_SECTION_NAMES.map((name) => [name.toLowerCase(), name]),
  ['attributes', 'Attributes & Properties'],
  ['properties', 'Attributes & Properties'],
  ['custom properties', 'CSS custom properties'],
]);

function checkApiReferenceOrder(file, src) {
  const start = src.search(/^## API reference\s*$/m);
  if (start === -1) return [];
  // Ignore code fences; the backreference closes a fence only on a run of
  // backticks as long as the one that opened it, so nested fences pair up.
  const api = src.slice(start).replace(/^(`{3,})[\s\S]*?^\1/gm, '');
  const end = api.slice(1).search(/^## /m);
  const body = end === -1 ? api : api.slice(0, end + 1);
  const mainElement = file.replace(/\.md$/, '');

  const problems = [];
  const sections = body.split(/^### /m).slice(1);
  let lastRank = -1;
  let lastGroup = null;
  const seenGroups = new Set();
  for (const section of sections) {
    const heading = section.slice(0, section.indexOf('\n')).trim();
    const [, group = null, name] = heading.match(/^(?:`([^`]+)`\s+)?(.*)$/);
    const where = `${file}: API reference "### ${heading}"`;
    const tables = [...section.matchAll(/<ApiTable\s([^>]*?)\/>/g)]
      .map((m) => ({
        element: m[1].match(/\belement="([^"]*)"/)?.[1],
        section: m[1].match(/\bsection="([^"]*)"/)?.[1],
      }))
      .filter((t) => t.element); // inline :data tables carry no element

    const canonical = API_SECTION_SPELLINGS.get(name.toLowerCase());
    if (!canonical) {
      // Companion section: a metadata table here means a mislabelled section.
      for (const t of tables) {
        problems.push(
          `${where} holds <ApiTable element="${t.element}" section="${t.section}" /> — put it under its own "### ${t.element === mainElement ? '' : `\`${t.element}\` `}<section>" heading`,
        );
      }
      continue;
    }
    if (canonical !== name) {
      problems.push(`${where} — write "${canonical}"`);
    }

    if (group !== lastGroup) {
      if (group === null || seenGroups.has(group)) {
        problems.push(
          `${where} — keep each element's sections together, main element first, then each sub-element`,
        );
      }
      seenGroups.add(group);
      lastGroup = group;
      lastRank = -1;
    }
    const rank = API_SECTION_NAMES.indexOf(canonical);
    if (rank <= lastRank) {
      problems.push(`${where} is out of order — expected: ${API_SECTION_NAMES.join(' → ')}`);
    }
    lastRank = rank;

    // The heading must match the data its tables render: same element (the
    // backticked sub-element, else the page's own) and an allowed section.
    const allowed = API_SECTION_DATA.get(canonical);
    for (const t of tables) {
      if (t.element !== (group ?? mainElement)) {
        problems.push(
          `${where} renders element="${t.element}", which belongs under another heading`,
        );
      }
      if (allowed.length && !allowed.includes(t.section)) {
        problems.push(
          `${where} renders section="${t.section}", which belongs under another heading`,
        );
      }
    }
  }
  return problems;
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const meta = JSON.parse(await readFile(META_PATH, 'utf-8'));
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  const registry = JSON.parse(await readFile(REGISTRY_PATH, 'utf-8'));
  const byName = new Map(meta.elements.map((e) => [e.name, e]));
  const regByName = new Map(registry.elements.map((e) => [e.name, e]));

  const errors = [];
  const warnings = [];

  // Pre-resolve all filesystem lookups concurrently so the validation loops
  // below stay synchronous (no await-in-loop).
  const nativeInSkill = meta.elements.filter(
    (el) => el.type === 'native' && regByName.get(el.name)?.inSkill,
  );
  const sidecarPresent = new Map(
    await Promise.all(
      nativeInSkill.map(async (el) => [
        el.name,
        await exists(join(ELEMENTS_SRC, el.name, `${el.name}.meta.ts`)),
      ]),
    ),
  );

  const docFiles = (await readdir(DOCS_DIR)).filter((f) => f.endsWith('.md'));
  const docSources = await Promise.all(
    docFiles.map(async (file) => [file, await readFile(join(DOCS_DIR, file), 'utf-8')]),
  );

  // 1–3: per-element invariants.
  for (const el of meta.elements) {
    const reg = regByName.get(el.name) ?? {};
    if (reg.inSkill && !el.summary) {
      errors.push(`${el.name}: inSkill element has no @summary`);
    }
    for (const p of el.cssProperties) {
      if (!p.description)
        warnings.push(`${el.name}: CSS custom property ${p.name} has no description`);
    }
    if (el.type === 'native' && reg.inSkill && !sidecarPresent.get(el.name)) {
      errors.push(`${el.name}: native inSkill element is missing its ${el.name}.meta.ts sidecar`);
    }
  }

  // 4–5: every doc reference resolves to real, non-empty data.
  // `element#section` pairs the docs render, for 8 below.
  const rendered = new Set();
  for (const [file, src] of docSources) {
    for (const m of src.matchAll(/<ApiTable\s+([^>]*?)\/>/g)) {
      const attrs = m[1];
      if (!/\belement=/.test(attrs)) continue; // inline :data table — not metadata-driven
      const element = attrs.match(/element="([^"]*)"/)?.[1];
      const section = attrs.match(/section="([^"]*)"/)?.[1];
      rendered.add(`${element}#${section}`);
      const el = byName.get(element);
      if (!el) {
        errors.push(`${file}: <ApiTable> references unknown element "${element}"`);
        continue;
      }
      if (!VALID_SECTIONS.has(section)) {
        errors.push(`${file}: <ApiTable element="${element}"> invalid section "${section}"`);
        continue;
      }
      if (!Array.isArray(el[section]) || el[section].length === 0) {
        errors.push(
          `${file}: <ApiTable element="${element}" section="${section}" /> resolves to an empty section (mis-route or missing source metadata)`,
        );
      }
    }

    for (const m of src.matchAll(/<ElementSpec\s+([^>]*?)\/>/g)) {
      const attrs = m[1];
      if (!/\belement=/.test(attrs)) continue;
      const element = attrs.match(/element="([^"]*)"/)?.[1];
      if (!byName.get(element)) {
        errors.push(`${file}: <ElementSpec> references unknown element "${element}"`);
      }
    }

    errors.push(...checkApiReferenceOrder(file, src));
  }

  // 8: an element documented anywhere lists its custom states too. Unlike
  // the other sections, nothing else on a page hints at them, so a new
  // `@cssstate` tag would otherwise never reach the reference.
  const documented = new Set([...rendered].map((pair) => pair.split('#')[0]));
  for (const el of meta.elements) {
    if (el.cssStates.length && documented.has(el.name) && !rendered.has(`${el.name}#cssStates`)) {
      errors.push(
        `${el.name}: has custom states (${el.cssStates.map((s) => s.name).join(', ')}) but no docs page renders <ApiTable element="${el.name}" section="cssStates" />`,
      );
    }
  }

  // 6: the Vite plugin can type every element it defines.
  //
  // `emitTypes` writes `import type { <class> } from '<pkg>/<name>/element'`
  // for each ELEMENT_CLASSES entry, into a file the consumer commits. Both
  // failure modes are silent — a missing key emits nothing (the plugin's own
  // "unknown element" warning cannot fire on the default path, since the name
  // list *is* the key list), and a wrong class name emits an unresolvable
  // import that only surfaces without `skipLibCheck`. The manifest is the
  // source of truth: it carries the module path and the exported class.
  //
  // The name comes from the module path, never from the tag: `<name>/element`
  // resolves to `dist/elements/<name>/<name>.d.ts`, so the directory IS the
  // importable name, and reading it here keeps the check free of any
  // assumption about the `l-` prefix the manifest happens to be built with.
  // `ElementBaseName` is a type — erased at runtime, so the union is read from
  // the source rather than imported.
  const registrySrc = await readFile(REGISTRY_SRC, 'utf-8');
  const union = /export type ElementBaseName =([\s\S]*?);/.exec(registrySrc)?.[1] ?? '';
  const baseNames = new Set([...union.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]));
  if (baseNames.size === 0) {
    errors.push(
      'registry.ts: could not read the ElementBaseName union — check 6 cannot verify element names against it',
    );
  }

  const CANONICAL_MODULE = /^src\/html\/elements\/([^/]+)\/([^/]+)\.ts$/;
  const declared = new Map();
  const misplaced = new Map();
  for (const mod of manifest.modules) {
    const [, dir, base] = CANONICAL_MODULE.exec(mod.path) ?? [];
    for (const decl of mod.declarations ?? []) {
      if (!decl.customElement || !decl.tagName) continue;
      // A class outside `<name>/<name>.ts` has no `<name>/element` module to
      // import from — the shape of the `toast-item` bug this check exists for.
      if (dir && dir === base) declared.set(dir, decl.name);
      else misplaced.set(decl.tagName, { className: decl.name, path: mod.path });
    }
  }

  for (const [name, className] of declared) {
    const mapped = Object.hasOwn(ELEMENT_CLASSES, name) ? ELEMENT_CLASSES[name] : undefined;
    if (!mapped) {
      errors.push(
        `${name}: missing from ELEMENT_CLASSES in vite-plugin.ts — emitTypes consumers get no typing for it; add '${name}': '${className}'`,
      );
    } else if (mapped !== className) {
      errors.push(
        `${name}: ELEMENT_CLASSES in vite-plugin.ts maps to "${mapped}", but the manifest declares "${className}" — emitTypes would emit an unresolvable import`,
      );
    }
    if (baseNames.size > 0 && !baseNames.has(name)) {
      errors.push(
        `${name}: missing from ElementBaseName in src/html/registry.ts — tagName()/cls() cannot be called for it`,
      );
    }
  }
  for (const name of Object.keys(ELEMENT_CLASSES)) {
    if (!declared.has(name)) {
      errors.push(
        `${name}: in ELEMENT_CLASSES in vite-plugin.ts but has no <name>/<name>.ts custom element in the manifest — emitTypes would emit an import from '<pkg>/${name}/element', which has no module behind it`,
      );
    }
  }
  for (const [tag, { className, path }] of misplaced) {
    warnings.push(
      `${tag}: ${className} is declared in ${path}, not <name>/<name>.ts — it cannot be typed by emitTypes and must stay out of ELEMENT_CLASSES`,
    );
  }

  for (const w of warnings) console.warn(`⚠ ${w}`);
  if (errors.length) {
    console.error(`\n✖ metadata check failed — ${errors.length} problem(s):`);
    for (const e of errors) console.error(`  ✖ ${e}`);
    process.exit(1);
  }
  console.log(
    `✓ metadata check passed (${meta.elements.length} elements, ${warnings.length} warning(s))`,
  );
}

main().catch((err) => {
  console.error('check-metadata failed to run:', err);
  process.exit(1);
});
