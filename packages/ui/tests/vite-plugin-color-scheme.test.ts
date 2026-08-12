import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import luxen from '../vite-plugin.js';

// The plugin bakes `luxen.config.mjs` values into the shipped module by
// rewriting its literal initialisers — there is no runtime config call in a
// consumer's entry point. So these tests run the transform over the **real
// module text**, not a hand-written approximation of it: if an initialiser is
// renamed or reshaped in `src/html/color-scheme.ts`, the pattern stops matching
// and a project's configuration silently reverts to the defaults, with no build
// error to notice. A fixture would keep passing through exactly that.
//
// Both shapes are covered because `isLuxenColorScheme` accepts both: `dist`
// carries `let _apply = false;`, while a project pointing at the source carries
// `let _apply: ColorSchemeApply = false;`.

const SOURCE_PATH = fileURLToPath(new URL('../src/html/color-scheme.ts', import.meta.url));
const SOURCE = readFileSync(SOURCE_PATH, 'utf-8');

/** What `tsc` emits for the same two lines, with the annotations stripped. */
const COMPILED = SOURCE.replace(': ColorSchemeApply = false;', ' = false;');

const DIST_ID = '/node_modules/luxen-ui/dist/color-scheme.js';
const SRC_ID = '/node_modules/luxen-ui/src/html/color-scheme.ts?used';

type TransformFn = (code: string, id: string) => { code: string } | null;

/** Run the plugin's `config` then `transform` hooks, as Vite would. */
async function transformWith(options: Parameters<typeof luxen>[0], code = COMPILED, id = DIST_ID) {
  const plugin = luxen(options);
  const configHook = plugin.config as unknown as () => Promise<unknown>;
  await configHook.call(plugin);
  const transform = plugin.transform as unknown as TransformFn;
  return transform.call(plugin, code, id);
}

describe('The module the plugin rewrites', () => {
  it('still declares the two initialisers the patterns depend on', () => {
    expect(SOURCE).toContain("let _storageKey = 'luxen-color-scheme';");
    expect(SOURCE).toContain('let _apply: ColorSchemeApply = false;');
  });
});

describe('A project configuring the color scheme in luxen.config', () => {
  it('bakes a custom storage key into the shipped store', async () => {
    const result = await transformWith({ colorScheme: { storageKey: 'acme-scheme' } });

    expect(result?.code).toContain('let _storageKey = "acme-scheme";');
    expect(result?.code).not.toContain("'luxen-color-scheme'");
  });

  it('bakes an empty key, so persistence is off without any runtime call', async () => {
    const result = await transformWith({ colorScheme: { storageKey: '' } });

    expect(result?.code).toContain('let _storageKey = "";');
  });

  it('bakes the apply target', async () => {
    const result = await transformWith({ colorScheme: { apply: 'root' } });

    expect(result?.code).toContain('let _apply = "root";');
  });

  it('bakes both halves into the TypeScript source too, annotation and all', async () => {
    const result = await transformWith(
      { colorScheme: { storageKey: 'acme-scheme', apply: 'root' } },
      SOURCE,
      SRC_ID,
    );

    // The annotation has to survive: the file is still type-checked after this.
    expect(result?.code).toContain('let _apply: ColorSchemeApply = "root";');
    expect(result?.code).toContain('let _storageKey = "acme-scheme";');
  });

  it('leaves the module alone when nothing is configured', async () => {
    expect(await transformWith({})).toBeNull();
    expect(await transformWith({ elementPrefix: 'pulse' })).toBeNull();
  });

  it('only rewrites the color-scheme module', async () => {
    const result = await transformWith(
      { colorScheme: { storageKey: 'acme-scheme' } },
      COMPILED,
      '/node_modules/luxen-ui/dist/elements/badge/badge.js',
    );

    expect(result).toBeNull();
  });
});
