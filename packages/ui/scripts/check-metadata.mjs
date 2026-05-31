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
 *
 * Usage: node scripts/check-metadata.mjs   (exit 0 = pass, 1 = problems)
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const META_PATH = resolve(PKG_ROOT, 'dist/metadata/index.json');
const REGISTRY_PATH = resolve(PKG_ROOT, 'elements.json');
const ELEMENTS_SRC = resolve(PKG_ROOT, 'src/html/elements');
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
