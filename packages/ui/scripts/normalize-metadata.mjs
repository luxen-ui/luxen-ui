/*
 * normalize-metadata.mjs — build step that turns the standard Custom Elements
 * Manifest (dist/custom-elements.json) + the element registry (elements.json)
 * into a single tooling-friendly metadata format under dist/metadata/.
 *
 *   dist/metadata/<name>.json   one normalized object per element
 *   dist/metadata/index.json    { version, elements: [<all objects>] }
 *
 * The normalized shape is IDENTICAL across element kinds (native CSS elements,
 * progressive/custom/shadow custom elements). Every array field is always
 * present (empty when N/A) so consumers never have to test for a key:
 *
 *   {
 *     name, displayName, type, isCustomElement, tag, nativeTag, selector,
 *     subItemOf, summary, status, appearances, import: { css, js },
 *     properties[], attributes[], events[], methods[], slots[],
 *     cssClasses[], cssParts[], cssProperties[], commands[], examples[]
 *   }
 *
 * `properties` are reactive custom-element properties (each with its reflected
 * `attribute`); `attributes` are author-set HTML/`data-*` attributes from
 * `@attribute` tags (native attrs like `disabled` plus `data-*` knobs).
 *
 * Sources of truth:
 *   - WC props/events/slots/parts/cssprops/commands/examples → element JSDoc
 *     (via the CEM analyzer + scripts/cem-plugins/*).
 *   - Native attributes/cssprops/summary/examples → <name>.meta.ts sidecar JSDoc.
 *   - type / status / appearances / displayName / flags → elements.json.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const MANIFEST_PATH = resolve(PKG_ROOT, 'dist/custom-elements.json');
const REGISTRY_PATH = resolve(PKG_ROOT, 'elements.json');
const CSS_DIR = resolve(PKG_ROOT, 'src/css/elements');
const OUT_DIR = resolve(PKG_ROOT, 'dist/metadata');

const ELEMENT_PREFIX = 'l';

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// "Dialog width. Default `31rem`." → { default: "31rem", description: "Dialog width." }
// Leaves description untouched (minus the matched phrase) when no default found.
function splitDefault(description = '') {
  const m = description.match(/\s*Defaults?\s+(?:to\s+)?`([^`]+)`\.?/i);
  if (!m) return { default: undefined, description: description.trim() };
  const cleaned = (description.slice(0, m.index) + description.slice(m.index + m[0].length)).trim();
  return { default: m[1], description: cleaned };
}

// A reactive property maps to an attribute, or is a primitive-typed field.
// Lit @query refs (e.g. `dialog: HTMLDialogElement`) are fields too but have no
// attribute and a DOM element type — exclude them from the public prop list.
function isQueryRef(member) {
  const t = member.type?.text ?? '';
  return member.attribute == null && t.endsWith('Element');
}

function normalizeProperties(members = []) {
  return members
    .filter((m) => m.kind === 'field' && !isQueryRef(m))
    .map((m) => {
      const { default: def, description } = splitDefault(m.description ?? '');
      return {
        name: m.name,
        attribute: m.attribute ?? null,
        type: m.type?.text ?? null,
        default: m.default ?? def ?? null,
        reflects: Boolean(m.reflects),
        description,
      };
    });
}

function normalizeMethods(members = []) {
  return members
    .filter((m) => m.kind === 'method')
    .map((m) => ({
      name: m.name,
      params: (m.parameters ?? []).map((p) => ({ name: p.name, type: p.type?.text ?? null })),
      returns: m.return?.type?.text ?? null,
      description: m.description ?? '',
    }));
}

// Collapse entries sharing a `name`, preferring the richest one (a non-empty
// description, then a non-null default). The analyzer can emit a custom property
// twice — once from the JSDoc `@cssproperty` (described) and once bare — which
// would otherwise surface as duplicate, blank-description rows.
function dedupeByName(list) {
  const byName = new Map();
  for (const item of list) {
    const prev = byName.get(item.name);
    if (!prev) {
      byName.set(item.name, item);
      continue;
    }
    const better =
      (item.description && !prev.description) ||
      (item.default != null && prev.default == null && !prev.description);
    if (better) byName.set(item.name, item);
  }
  return [...byName.values()];
}

function normalizeCssProperties(list = []) {
  return dedupeByName(
    list.map((p) => {
      const { default: def, description } = splitDefault(p.description ?? '');
      return { name: p.name, default: p.default ?? def ?? null, description };
    }),
  );
}

function normalizeSlots(list = []) {
  return list.map((s) => ({ name: s.name ?? '', description: s.description ?? '' }));
}

function normalizeParts(list = []) {
  return list.map((p) => ({ name: p.name, description: p.description ?? '' }));
}

function normalizeEvents(list = []) {
  return list.map((e) => ({
    name: e.name,
    description: e.description ?? '',
    cancelable: Boolean(e.cancelable),
  }));
}

// HTML attributes a consumer can set: native HTML attrs (disabled, command…)
// and `data-*` styling knobs (data-variant…). The `data` flag distinguishes
// them so a consumer can group/style if desired.
function normalizeAttributes(list = []) {
  return list.map((a) => ({
    name: a.name,
    data: a.name.startsWith('data-'),
    values: a.values ?? [],
    description: a.description ?? '',
  }));
}

function normalizeCommands(list = []) {
  return list.map((c) => ({ name: c.name, description: c.description ?? '' }));
}

function normalizeCssClasses(list = []) {
  return list.map((c) => ({ name: c.name, description: c.description ?? '' }));
}

function normalizeExamples(list = []) {
  return list.map((e) => ({
    title: e.title ?? null,
    language: e.language ?? 'html',
    code: e.code ?? '',
  }));
}

// Locate the manifest declaration for a registry entry.
function findDeclaration(manifest, entry) {
  const tag = `${ELEMENT_PREFIX}-${entry.name}`;
  for (const mod of manifest.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (entry.type === 'native' || entry.kind === 'native') {
        // Native sidecar declaration carries the _native flag.
        if (decl._native && mod.path.endsWith(`/${entry.name}/${entry.name}.meta.ts`)) {
          return decl;
        }
      } else if (decl.tagName === tag) {
        return decl;
      }
    }
  }
  return null;
}

async function buildImport(entry, isCustomElement) {
  // Consumer CSS exists as a flat file or an appearance directory.
  const hasCss =
    (await exists(join(CSS_DIR, `${entry.name}.css`))) || (await exists(join(CSS_DIR, entry.name)));
  const css = hasCss
    ? entry.appearances?.length
      ? `luxen-ui/css/${entry.name}/${entry.appearances[0]}`
      : `luxen-ui/css/${entry.name}`
    : null;
  const js = isCustomElement ? `luxen-ui/${entry.name}` : null;
  return { css, js };
}

async function normalizeElement(entry, decl) {
  const isCustomElement = entry.type !== 'native' && entry.kind !== 'native';
  const tag = isCustomElement ? `${ELEMENT_PREFIX}-${entry.name}` : null;
  // The underlying HTML element a native element styles (button, kbd, …).
  const nativeTag = isCustomElement ? null : (decl?._nativeTag ?? null);
  const selector = decl?.selector ?? entry.selector ?? (isCustomElement ? tag : `.l-${entry.name}`);

  return {
    name: entry.name,
    displayName: entry.displayName,
    type: entry.type ?? (entry.kind === 'native' ? 'native' : null),
    isCustomElement,
    tag,
    nativeTag,
    selector,
    // Set on sub-components (e.g. l-tree-item → "tree"); null for top-level elements.
    subItemOf: entry.subItemOf ?? null,
    summary: decl?.summary ?? decl?.description ?? '',
    status: entry.status ?? 'stable',
    appearances: entry.appearances ?? [],
    import: await buildImport(entry, isCustomElement),
    properties: normalizeProperties(decl?.members),
    attributes: normalizeAttributes(decl?._attributes),
    events: normalizeEvents(decl?.events),
    methods: normalizeMethods(decl?.members),
    slots: normalizeSlots(decl?.slots),
    cssClasses: normalizeCssClasses(decl?._cssClasses),
    cssParts: normalizeParts(decl?.cssParts),
    cssProperties: normalizeCssProperties(decl?.cssProperties),
    commands: normalizeCommands(decl?.commands),
    examples: normalizeExamples(decl?.examples),
  };
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
  const registry = JSON.parse(await readFile(REGISTRY_PATH, 'utf-8'));
  const version = JSON.parse(await readFile(resolve(PKG_ROOT, 'package.json'), 'utf-8')).version;

  await mkdir(OUT_DIR, { recursive: true });

  const missing = registry.elements
    .filter((e) => !findDeclaration(manifest, e) && (e.inSkill || e.inMockups))
    .map((e) => e.name);

  // Normalize all entries in parallel; Promise.all preserves input order, so the
  // aggregated index stays deterministic regardless of fs timing.
  const all = await Promise.all(
    registry.elements.map((entry) => normalizeElement(entry, findDeclaration(manifest, entry))),
  );

  await Promise.all([
    ...all.map((el) =>
      writeFile(join(OUT_DIR, `${el.name}.json`), JSON.stringify(el, null, 2) + '\n'),
    ),
    writeFile(
      join(OUT_DIR, 'index.json'),
      JSON.stringify({ version, elements: all }, null, 2) + '\n',
    ),
  ]);

  console.log(`Normalized metadata for ${all.length} elements → dist/metadata/`);
  if (missing.length) {
    console.log(`  (no manifest declaration yet for: ${missing.join(', ')})`);
  }
}

main().catch((err) => {
  console.error('normalize-metadata failed:', err);
  process.exit(1);
});
