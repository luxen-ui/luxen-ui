import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { optimizeDeps, resolveConfig, type UserConfig } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import luxen, { type LuxenOptions } from '../vite-plugin.js';

// In `vite dev`, Vite pre-bundles a dependency installed from npm into
// `.vite/deps`, and never runs a plugin's `transform` over it. So the plugin
// bakes `luxen.config.mjs` values inside the dependency optimizer too, or they
// would reach `vite build` only. Tests of the `transform` hook alone kept
// passing through exactly that, so these run Vite's real optimizer over a
// `luxen-ui` installed as a plain directory, as npm installs it. (A workspace
// link is not pre-bundled by default, and the demo app that links it sets its
// prefix at runtime too: neither could show this.)
//
// The fixture holds the TypeScript source of the modules the plugin rewrites,
// rather than `dist`, so the suite does not depend on a build having run. The
// plugin accepts both, and the optimizer bundles both.

const SOURCE_DIR = fileURLToPath(new URL('../src/html/', import.meta.url));

/**
 * A project with the package installed as a plain directory in `node_modules`,
 * under `name`: an npm alias (`"pulse-ui": "npm:luxen-ui@…"`) installs it under
 * its alias, with its own `package.json` unchanged.
 */
function createProject(name = 'luxen-ui'): string {
  const root = mkdtempSync(join(tmpdir(), 'luxen-optimize-deps-'));
  const pkg = join(root, 'node_modules', name);
  mkdirSync(join(pkg, 'src', 'html'), { recursive: true });
  for (const file of ['registry.ts', 'color-scheme.ts']) {
    cpSync(join(SOURCE_DIR, file), join(pkg, 'src', 'html', file));
  }
  writeFileSync(
    join(pkg, 'package.json'),
    JSON.stringify({
      name: 'luxen-ui',
      type: 'module',
      exports: {
        '.': './src/html/registry.ts',
        './color-scheme': './src/html/color-scheme.ts',
      },
    }),
  );
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'project', type: 'module' }));
  return root;
}

let run = 0;

/**
 * Pre-bundle the project's package the way `vite dev` does on start-up.
 * `force: false` reuses `.vite/deps` when Vite judges the cache still valid,
 * as a plain restart would.
 */
async function preBundle(
  root: string,
  options: LuxenOptions,
  { force = true, name = 'luxen-ui' } = {},
) {
  const config = await resolveConfig(
    {
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [luxen(options)],
      optimizeDeps: { include: [name, `${name}/color-scheme`] },
    },
    'serve',
  );
  const metadata = await optimizeDeps(config, force);

  const fileOf = (id: string): string => {
    const file = metadata.optimized[id]?.file;
    if (!file) throw new Error(`${id} was not pre-bundled`);
    return isAbsolute(file) ? file : join(config.cacheDir, 'deps', file);
  };

  // A fresh URL each time: Node caches modules by URL, and a later run writes
  // over the same file.
  run += 1;
  const registry = (await import(`${pathToFileURL(fileOf(name)).href}?run=${run}`)) as {
    getPrefix(): { element: string; css: string };
  };

  return {
    prefix: registry.getPrefix(),
    colorScheme: readFileSync(fileOf(`${name}/color-scheme`), 'utf8'),
  };
}

describe('Vite pre-bundling luxen-ui for dev', () => {
  let root: string;
  beforeAll(() => {
    root = createProject();
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('bakes the configured prefixes and color scheme into the pre-bundled modules', async () => {
    const result = await preBundle(root, {
      elementPrefix: 'acme',
      cssPrefix: 'ac',
      colorScheme: { storageKey: 'acme-scheme', apply: 'root' },
    });

    expect(result.prefix).toEqual({ element: 'acme', css: 'ac' });
    expect(result.colorScheme).toMatch(/_storageKey = ["']acme-scheme["']/);
    expect(result.colorScheme).toMatch(/_apply = ["']root["']/);
  });

  it('serves what the package ships when nothing is configured', async () => {
    const result = await preBundle(root, {});

    expect(result.prefix).toEqual({ element: 'l', css: 'l' });
    expect(result.colorScheme).toMatch(/_storageKey = ["']luxen-color-scheme["']/);
  });

  it('bakes a color-scheme configuration that renames nothing', async () => {
    const result = await preBundle(root, { colorScheme: { apply: 'root' } });

    expect(result.prefix).toEqual({ element: 'l', css: 'l' });
    expect(result.colorScheme).toMatch(/_apply = ["']root["']/);
  });

  it('bakes a value exactly, whatever characters it holds', async () => {
    const result = await preBundle(root, { elementPrefix: "it's-$&", cssPrefix: `$'"\\` });

    expect(result.prefix).toEqual({ element: "it's-$&", css: `$'"\\` });
  });

  it('bakes the new values after the configuration changes, without clearing the cache', async () => {
    await preBundle(root, { elementPrefix: 'acme' });
    const result = await preBundle(root, { elementPrefix: 'zeta' }, { force: false });

    expect(result.prefix.element).toBe('zeta');
  });

  it('bakes a copy installed under an npm alias', async () => {
    const aliased = createProject('pulse-ui');
    try {
      const result = await preBundle(
        aliased,
        { elementPrefix: 'pulse', colorScheme: { storageKey: 'pulse-scheme' } },
        { name: 'pulse-ui' },
      );

      expect(result.prefix.element).toBe('pulse');
      expect(result.colorScheme).toMatch(/_storageKey = ["']pulse-scheme["']/);
    } finally {
      rmSync(aliased, { recursive: true, force: true });
    }
  });
});

/** The `optimizeDeps` the plugin's `config` hook returns, called with Vite's `this`. */
async function optimizerOptions(options: LuxenOptions, context?: unknown) {
  const plugin = luxen(options);
  const configHook = plugin.config as unknown as (this: unknown) => Promise<UserConfig | undefined>;
  const config = await configHook.call(context);
  return config?.optimizeDeps;
}

type OnLoad = (args: { path: string }) => Promise<{ contents: string; loader: string } | undefined>;

/** Run the esbuild plugin's `setup` against a stub build and return its `onLoad`. */
async function esbuildPlugin(options: LuxenOptions, context?: unknown) {
  const optimizer = await optimizerOptions(options, context);
  const plugins = (optimizer?.esbuildOptions?.plugins ?? []) as Array<{
    name: string;
    setup(build: unknown): void;
  }>;
  const [plugin] = plugins;
  let onLoad: OnLoad | undefined;
  let onLoadOptions: { filter: RegExp; namespace?: string } | undefined;
  plugin?.setup({
    onLoad: (loadOptions: { filter: RegExp; namespace?: string }, callback: OnLoad) => {
      onLoadOptions = loadOptions;
      onLoad = callback;
    },
  });
  return { name: plugin?.name, onLoad, onLoadOptions, rolldown: optimizer?.rolldownOptions };
}

describe('The optimizer the plugin configures', () => {
  const VITE_8 = { meta: { viteVersion: '8.0.0', rolldownVersion: '1.0.0' } };
  const VITE_7 = { meta: { viteVersion: '7.0.0', rollupVersion: '4.0.0' } };

  let root: string;
  beforeAll(() => {
    root = createProject();
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const moduleOf = (file: string) => join(root, 'node_modules', 'luxen-ui', 'src', 'html', file);

  it('stays out of the optimizer when nothing is configured', async () => {
    expect(await optimizerOptions({}, VITE_8)).toBeUndefined();
    expect(await optimizerOptions({}, VITE_7)).toBeUndefined();
  });

  it('goes through Rolldown on Vite 8, with no deprecated esbuild option', async () => {
    const optimizer = await optimizerOptions({ elementPrefix: 'acme' }, VITE_8);

    expect(optimizer?.rolldownOptions?.plugins).toHaveLength(1);
    expect(optimizer?.esbuildOptions).toBeUndefined();
  });

  // Vite 7 passes a `meta` without `rolldownVersion`; Vite 5 and 6 pass no `this`.
  for (const [vite, context] of [
    ['Vite 7', VITE_7],
    ['Vite 5 and 6', undefined],
  ] as const) {
    it(`bakes through an esbuild plugin on ${vite}`, async () => {
      const plugin = await esbuildPlugin({ elementPrefix: 'acme' }, context);
      expect(plugin.rolldown).toBeUndefined();

      const result = await plugin.onLoad?.({ path: moduleOf('registry.ts') });
      expect(result?.loader).toBe('ts');
      expect(result?.contents).toContain('let _elementPrefix = "acme";');

      // Untouched modules fall through to esbuild's own loader.
      expect(await plugin.onLoad?.({ path: moduleOf('color-scheme.ts') })).toBeUndefined();

      // It reads the file at `path`: a virtual module, in another namespace,
      // has none to read.
      expect(plugin.onLoadOptions?.namespace).toBe('file');
    });
  }

  // Vite keys the `.vite/deps` cache on the optimizer plugins' names (esbuild
  // and Rolldown alike), not on what they do.
  it('names its plugin after the values it bakes, so the dev cache follows them', async () => {
    const acme = await esbuildPlugin({ elementPrefix: 'acme' });
    const again = await esbuildPlugin({ elementPrefix: 'acme' });
    const zeta = await esbuildPlugin({ elementPrefix: 'zeta' });
    const scheme = await esbuildPlugin({
      elementPrefix: 'acme',
      colorScheme: { storageKey: 'acme-scheme' },
    });

    expect(again.name).toBe(acme.name);
    expect(zeta.name).not.toBe(acme.name);
    expect(scheme.name).not.toBe(acme.name);
  });
});
