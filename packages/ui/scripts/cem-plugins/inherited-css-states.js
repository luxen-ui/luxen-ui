/*
 * cem-plugin: inherited-css-states
 *
 * Custom states (`:state(name)`) are documented with the standard `@cssstate`
 * JSDoc tag, which CEM reads into `declaration.cssStates` on its own. CEM also
 * copies them down to subclasses — but only when the base class is analyzed,
 * and the analyzer globs `src/html/elements/` alone. Shared base classes such
 * as `LuxenFormAssociatedElement` (`src/html/shared/`) stay out on purpose:
 * pulling them in would also copy every inherited member into each element's
 * reference.
 *
 * So this plugin reads the `@cssstate` tags of those base classes straight
 * from their source and appends them to every declaration that extends one.
 * The base class JSDoc stays the single source of truth.
 *
 *   @cssstate user-invalid - The value is invalid and the user has interacted.
 *
 * Output: declaration.cssStates += [{ name, description }]
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SHARED = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/html/shared');

/** Base class name → its source file. */
const BASES = {
  LuxenFormAssociatedElement: resolve(SHARED, 'luxen-form-associated-element.ts'),
};

/** The `@cssstate` tags of the JSDoc block right above `export class <name>`. */
function readStates(name, file) {
  const src = readFileSync(file, 'utf-8');
  const classAt = src.search(new RegExp(`^export (?:abstract )?class ${name}\\b`, 'm'));
  if (classAt === -1) throw new Error(`inherited-css-states: no class ${name} in ${file}`);
  const before = src.slice(0, classAt);
  const docAt = before.lastIndexOf('/**');
  const doc = docAt === -1 ? '' : before.slice(docAt);
  if (!/\*\/\s*$/.test(doc)) return [];

  const states = [];
  for (const m of doc.matchAll(/@cssstate\s+(\S+)\s*-?\s*([^@]*)/g)) {
    const description = m[2]
      .replace(/\*\/\s*$/, '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean)
      .join(' ');
    states.push({ name: m[1], description });
  }
  return states;
}

export function inheritedCssStatesPlugin() {
  const statesOf = new Map(
    Object.entries(BASES).map(([name, file]) => [name, readStates(name, file)]),
  );

  return {
    name: 'luxen-inherited-css-states',
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        for (const decl of mod.declarations ?? []) {
          const inherited = statesOf.get(decl.superclass?.name);
          if (!inherited?.length) continue;
          const own = decl.cssStates ?? [];
          const names = new Set(own.map((s) => s.name));
          decl.cssStates = [...own, ...inherited.filter((s) => !names.has(s.name))];
        }
      }
    },
  };
}
