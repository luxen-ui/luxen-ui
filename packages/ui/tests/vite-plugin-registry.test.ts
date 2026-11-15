import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transformWithOxc } from 'vite';
import { describe, expect, it } from 'vite-plus/test';
import luxen from '../vite-plugin.js';

// The plugin bakes a renamed prefix into the shipped registry by rewriting its
// literal initialisers. These tests run the transform over the **real module
// text**, as `vite-plugin-color-scheme.test.ts` does for the color scheme: a
// renamed or reshaped initialiser would silently bring back the `l` prefix.
//
// The registry declares the same two lines in `src/html/registry.ts` and in
// `dist/registry.js`, so the source stands in for both.

const SOURCE = readFileSync(
  fileURLToPath(new URL('../src/html/registry.ts', import.meta.url)),
  'utf-8',
);

type TransformFn = (code: string, id: string) => { code: string } | null;

/** Run the plugin's `config` then `transform` hooks, as Vite would. */
async function transformWith(options: Parameters<typeof luxen>[0], id: string, code = SOURCE) {
  const plugin = luxen(options);
  const configHook = plugin.config as unknown as () => Promise<unknown>;
  await configHook.call(plugin);
  const transform = plugin.transform as unknown as TransformFn;
  return transform.call(plugin, code, id);
}

describe('The module the plugin rewrites', () => {
  it('still declares the two initialisers the patterns depend on', () => {
    expect(SOURCE).toContain("let _elementPrefix = 'l';");
    expect(SOURCE).toContain("let _cssPrefix = 'l';");
  });
});

describe('A project renaming the prefixes in luxen.config', () => {
  // Wherever the package manager put the package, Vite hands the plugin the
  // id of the file it really reads.
  const INSTALLS = {
    'npm or yarn': '/app/node_modules/luxen-ui/dist/registry.js',
    pnpm: '/app/node_modules/.pnpm/luxen-ui@1.0.0/node_modules/luxen-ui/dist/registry.js',
    // A workspace package, `npm link` or a `file:` dependency resolves to its
    // real directory, which need not be called `luxen-ui`.
    'a linked install': '/work/design-system/packages/ui/dist/registry.js',
    // `"pulse-ui": "npm:luxen-ui@…"` installs the package under its alias.
    'an npm alias': '/app/node_modules/pulse-ui/dist/registry.js',
    Windows: 'C:\\app\\node_modules\\luxen-ui\\dist\\registry.js',
    'the TypeScript source': '/work/luxen/packages/ui/src/html/registry.ts?used',
  };

  for (const [install, id] of Object.entries(INSTALLS)) {
    it(`bakes both prefixes into the registry from ${install}`, async () => {
      const result = await transformWith({ elementPrefix: 'pulse', cssPrefix: 'p' }, id);

      expect(result?.code).toContain('let _elementPrefix = "pulse";');
      expect(result?.code).toContain('let _cssPrefix = "p";');
    });
  }

  it("bakes the source as Vite's own TypeScript transform hands it over", async () => {
    // A plugin's `transform` runs after Vite's, which prints `'l'` as `"l"`:
    // a project pointing Vite at the source only ever shows the plugin that.
    const id = '/work/luxen/packages/ui/src/html/registry.ts';
    const { code } = await transformWithOxc(SOURCE, id);
    const result = await transformWith({ elementPrefix: 'pulse', cssPrefix: 'p' }, id, code);

    expect(result?.code).toContain('let _elementPrefix = "pulse";');
    expect(result?.code).toContain('let _cssPrefix = "p";');
  });

  it('writes each value as a string literal, whatever characters it holds', async () => {
    // A quote would end a hand-quoted literal early, and `$&` or `$'` would be
    // read as a replacement pattern by `String.replace`.
    const elementPrefix = "it's-$&";
    const cssPrefix = `$'"\\`;
    const result = await transformWith(
      { elementPrefix, cssPrefix },
      '/app/node_modules/luxen-ui/dist/registry.js',
    );

    expect(result?.code).toContain(`let _elementPrefix = ${JSON.stringify(elementPrefix)};`);
    expect(result?.code).toContain(`let _cssPrefix = ${JSON.stringify(cssPrefix)};`);
  });

  it('leaves the registry alone when the prefixes are the defaults', async () => {
    expect(await transformWith({}, '/app/node_modules/luxen-ui/dist/registry.js')).toBeNull();
  });

  it("leaves another package's dist/registry.js alone", async () => {
    const other = "const registry = new Map();\nlet _elementPrefix = 'l';\nexport { registry };\n";

    expect(
      await transformWith(
        { elementPrefix: 'pulse' },
        '/app/node_modules/other/dist/registry.js',
        other,
      ),
    ).toBeNull();
  });

  it('leaves the other modules of the package alone', async () => {
    expect(
      await transformWith({ elementPrefix: 'pulse' }, '/app/node_modules/luxen-ui/dist/define.js'),
    ).toBeNull();
  });
});
