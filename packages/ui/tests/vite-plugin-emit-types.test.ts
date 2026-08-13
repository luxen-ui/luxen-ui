import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import luxen from '../vite-plugin.js';

// `emitTypes` writes a declaration file into the consumer's source tree, once,
// and tells them to commit it. Both ways it can be wrong are silent:
//
//   - an element missing from `ELEMENT_CLASSES` emits nothing at all, and the
//     plugin's own "unknown element" warning cannot report it (on the default
//     path the name list *is* the key list, so the filter is empty by
//     construction) — the element is simply untyped, which under
//     `strictTemplates` looks like the consumer's mistake;
//   - an entry naming a class that isn't exported at `<name>/element` emits an
//     import with no module behind it, which only errors when the consumer
//     type-checks declaration files (`skipLibCheck: false`).
//
// So these tests run the real emitter and check the emitted text against the
// element registry and the element sources, rather than against a fixture that
// would drift with the map it is supposed to police. `scripts/check-metadata.mjs`
// (check 6) enforces the same invariant during the build, where it can read the
// generated manifest; this file covers a tree that has never been built.

const PKG_ROOT = fileURLToPath(new URL('..', import.meta.url));
const ELEMENTS_SRC = resolve(PKG_ROOT, 'src/html/elements');

interface RegistryEntry {
  name: string;
  kind: 'element' | 'native';
}

/** Every element that ships a custom-element class (native CSS-only ones have none). */
const CUSTOM_ELEMENTS: string[] = (
  JSON.parse(readFileSync(resolve(PKG_ROOT, 'elements.json'), 'utf-8')) as {
    elements: RegistryEntry[];
  }
).elements
  .filter((e) => e.kind === 'element')
  .map((e) => e.name);

const IMPORT_LINE = /^import type \{ (\w+) \} from 'luxen-ui\/([a-z-]+)\/element';$/gm;

const TMP = mkdtempSync(join(tmpdir(), 'luxen-emit-types-'));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

let seq = 0;

/** Run the plugin's `config` hook, as Vite would, and read back what it wrote. */
async function emit(target?: 'dom' | 'vue', elementPrefix?: string): Promise<string> {
  const path = join(TMP, `${target ?? 'default'}-${++seq}.d.ts`);
  const plugin = luxen({ elementPrefix, emitTypes: { path, target } });
  const configHook = plugin.config as unknown as () => Promise<unknown>;
  await configHook.call(plugin);
  return readFileSync(path, 'utf-8');
}

// The `l-` literals below are the assertion, not a hardcoded prefix: these
// cases pin the *default* output, and the rebranding case that follows proves
// the prefix is really configurable. Going through `tagName()` here would make
// each expectation restate the implementation and assert nothing.
describe('The declaration file emitTypes writes', () => {
  it('types every custom element the library ships', async () => {
    const emitted = await emit();
    const untyped = CUSTOM_ELEMENTS.filter((name) => !emitted.includes(`'l-${name}':`));
    expect(untyped).toEqual([]);
  });

  it('imports each class from a module the package actually publishes', async () => {
    const emitted = await emit();
    const imports = [...emitted.matchAll(IMPORT_LINE)].map(([, className, name]) => ({
      className,
      name,
    }));

    // `luxen-ui/<name>/element` resolves to `dist/elements/<name>/<name>.d.ts`,
    // compiled from `src/html/elements/<name>/<name>.ts` (tsconfig.build.json
    // sets rootDir to src/html). A class exported from a sibling module — as
    // ToastItem is, from toast/toast.ts — has no such path and cannot be
    // imported by the emitted file.
    const unresolvable = imports.filter(({ className, name }) => {
      const source = join(ELEMENTS_SRC, name, `${name}.ts`);
      return !existsSync(source) || !readFileSync(source, 'utf-8').includes(`class ${className}`);
    });
    expect(unresolvable).toEqual([]);
    expect(imports.length).toBe(CUSTOM_ELEMENTS.length);
  });

  it('carries l-color-scheme-icon through every section of the vue flavour', async () => {
    const emitted = await emit('vue');
    expect(emitted).toContain(
      "import type { ColorSchemeIcon } from 'luxen-ui/color-scheme-icon/element';",
    );
    expect(emitted).toContain("'l-color-scheme-icon': ColorSchemeIcon;");
    expect(emitted).toContain(
      "'l-color-scheme-icon': DefineComponent<ElementProps<ColorSchemeIcon>>;",
    );
    expect(emitted).toContain('ColorSchemeIcon,');
  });

  // The whole reason this file is emitted per-project rather than shipped:
  // packages/ui/CLAUDE.md forbids the library from carrying a fixed-prefix
  // `HTMLElementTagNameMap` augmentation, so a rebranded consumer gets its
  // typing from here or not at all.
  it('follows a rebranded element prefix everywhere it names a tag', async () => {
    const emitted = await emit('vue', 'po');
    expect(emitted).toContain("'po-color-scheme-icon': ColorSchemeIcon;");
    expect(emitted).toContain(
      "'po-color-scheme-icon': DefineComponent<ElementProps<ColorSchemeIcon>>;",
    );
    const stale = CUSTOM_ELEMENTS.filter((name) => emitted.includes(`'l-${name}':`));
    expect(stale).toEqual([]);
  });
});
