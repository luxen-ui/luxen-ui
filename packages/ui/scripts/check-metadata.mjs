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
  'cssProperties',
  'commands',
  'examples',
]);

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
  for (const [file, src] of docSources) {
    for (const m of src.matchAll(/<ApiTable\s+([^>]*?)\/>/g)) {
      const attrs = m[1];
      if (!/\belement=/.test(attrs)) continue; // inline :data table — not metadata-driven
      const element = attrs.match(/element="([^"]*)"/)?.[1];
      const section = attrs.match(/section="([^"]*)"/)?.[1];
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
