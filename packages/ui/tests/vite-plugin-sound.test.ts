import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseAst, transformWithOxc } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { presets, type SoundName } from '../src/html/sound/presets.js';
import type { SoundRecipe } from '../src/html/sound/synth.js';
import luxen, { type SoundOptions } from '../vite-plugin.js';

// The plugin bakes `luxen.config.mjs` values into the shipped sound store by
// rewriting its literal initialisers. These tests run the transform over the
// **real module text** — the TypeScript source, and the compiled `dist` file
// when a build exists — because a renamed or reshaped initialiser would make a
// project's configuration silently revert to the defaults, with no build error.

const SOURCE = readFileSync(
  fileURLToPath(new URL('../src/html/sound/index.ts', import.meta.url)),
  'utf-8',
);
const DIST_PATH = fileURLToPath(new URL('../dist/sound/index.js', import.meta.url));

const DIST_ID = '/node_modules/luxen-ui/dist/sound/index.js';
const SRC_ID = '/node_modules/luxen-ui/src/html/sound/index.ts?used';

const INITIALISERS = [
  "let _storageKey = 'luxen-sound';",
  'let _volume = 0.7;',
  'let _events = true;',
  'let _clicks = false;',
];
const PRESETS_IN_SOURCE = 'let _presets: SoundPresets = {};';
const PRESETS_IN_DIST = 'let _presets = {};';

/** A recipe the checks accept: one short sine. */
const CHIME = [{ wave: 'sine', frequency: 880, decay: 0.08, gain: 0.1 }] as const;

type TransformFn = (code: string, id: string) => { code: string } | null;

/** Run the plugin's `config` then `transform` hooks, as Vite would. */
async function transformWith(options: Parameters<typeof luxen>[0], code = SOURCE, id = DIST_ID) {
  const plugin = luxen(options);
  const configHook = plugin.config as unknown as () => Promise<unknown>;
  await configHook.call(plugin);
  const transform = plugin.transform as unknown as TransformFn;
  return transform.call(plugin, code, id);
}

describe('The module the plugin rewrites', () => {
  it('still declares the initialisers the patterns depend on', () => {
    for (const line of [...INITIALISERS, PRESETS_IN_SOURCE]) expect(SOURCE).toContain(line);
  });

  it.runIf(existsSync(DIST_PATH))('ships them unchanged in dist', () => {
    const dist = readFileSync(DIST_PATH, 'utf-8');
    for (const line of [...INITIALISERS, PRESETS_IN_DIST]) expect(dist).toContain(line);
  });

  it('has no default that could turn sound on', () => {
    expect(SOURCE).not.toMatch(/let _default\b/);
  });
});

describe('A project configuring sound in luxen.config', () => {
  it('bakes a custom storage key into the shipped store', async () => {
    const result = await transformWith({ sound: { storageKey: 'acme-sound' } });

    expect(result?.code).toContain('let _storageKey = "acme-sound";');
    expect(result?.code).not.toContain("'luxen-sound'");
  });

  it('bakes an empty key, so the choice lasts the visit without any runtime call', async () => {
    const result = await transformWith({ sound: { storageKey: '' } });

    expect(result?.code).toContain('let _storageKey = "";');
  });

  it('bakes the volume and which interactions are heard', async () => {
    const result = await transformWith({ sound: { volume: 0.4, events: false, clicks: true } });

    expect(result?.code).toContain('let _volume = 0.4;');
    expect(result?.code).toContain('let _events = false;');
    expect(result?.code).toContain('let _clicks = true;');
  });

  it('bakes the TypeScript source too', async () => {
    const result = await transformWith({ sound: { clicks: true } }, SOURCE, SRC_ID);

    expect(result?.code).toContain('let _clicks = true;');
  });

  it('leaves the module alone when nothing is configured', async () => {
    expect(await transformWith({})).toBeNull();
    expect(await transformWith({ colorScheme: { storageKey: 'acme-scheme' } })).toBeNull();
  });

  it('cannot be used to turn sound on', async () => {
    // A plain-JS config gets past the type; there is still nothing to rewrite.
    const result = await transformWith({ sound: { default: true } } as never);

    expect(result).toBeNull();
  });

  it("bakes the source as Vite's own TypeScript transform hands it over", async () => {
    // A plugin's `transform` runs after Vite's, which drops the annotations and
    // prints `'luxen-sound'` with double quotes.
    const id = '/work/luxen/packages/ui/src/html/sound/index.ts';
    const { code } = await transformWithOxc(SOURCE, id);
    const result = await transformWith(
      { sound: { storageKey: 'acme-sound', clicks: true, presets: { tap: CHIME } } },
      code,
      id,
    );

    expect(result?.code).toContain('let _storageKey = "acme-sound";');
    expect(result?.code).toContain('let _clicks = true;');
    expect(result?.code).toContain(`let _presets = ${JSON.stringify({ tap: CHIME })};`);
  });

  it.each([
    ['a linked install', '/work/design-system/packages/ui/dist/sound/index.js'],
    ['an npm alias', '/app/node_modules/pulse-ui/dist/sound/index.js'],
    ['Windows', 'C:\\app\\node_modules\\luxen-ui\\dist\\sound\\index.js'],
  ])('bakes the store from %s', async (_install: string, id: string) => {
    const result = await transformWith({ sound: { clicks: true } }, SOURCE, id);

    expect(result?.code).toContain('let _clicks = true;');
  });

  it('only rewrites the sound store', async () => {
    const options = { sound: { clicks: true } };

    expect(
      await transformWith(options, SOURCE, '/node_modules/luxen-ui/dist/sound/synth.js'),
    ).toBeNull();
    expect(
      await transformWith(options, SOURCE, '/node_modules/luxen-ui/dist/color-scheme.js'),
    ).toBeNull();
  });
});

describe('A project giving sound its own recipes in luxen.config', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.runIf(existsSync(DIST_PATH))(
    'bakes them over the defaults into the shipped store',
    async () => {
      const dist = readFileSync(DIST_PATH, 'utf-8');
      const result = await transformWith({ sound: { presets: { notify: CHIME } } }, dist);

      // Only the project's recipes: the store falls back to the defaults.
      expect(result?.code).toContain(`let _presets = ${JSON.stringify({ notify: CHIME })};`);
      // Still a module a bundler can read.
      expect(() => parseAst(result!.code)).not.toThrow();
    },
  );

  it('bakes the TypeScript source too', async () => {
    const result = await transformWith({ sound: { presets: { tap: CHIME } } }, SOURCE, SRC_ID);

    expect(result?.code).toContain(
      `let _presets: SoundPresets = ${JSON.stringify({ tap: CHIME })};`,
    );
  });

  it('leaves the module alone when no recipe is given', async () => {
    expect(await transformWith({ sound: { presets: {} } })).toBeNull();
  });

  it.each(Object.keys(presets))(
    'accepts a recipe for %s, a sound the store knows',
    async (name: string) => {
      const result = await transformWith({ sound: { presets: { [name]: CHIME } } });

      expect(result?.code).toContain(`"${name}":`);
    },
  );

  it('accepts a default recipe retuned in the config file', async () => {
    const quieter = structuredClone(presets.notify);
    for (const layer of quieter) layer.gain = (layer.gain ?? 0.2) / 2;

    await expect(
      transformWith({ sound: { presets: { notify: quieter } } }),
    ).resolves.not.toBeNull();
  });

  it('stops the build on a name that is no sound, and says which', async () => {
    await expect(
      transformWith({ sound: { presets: { notifiy: CHIME } } } as never),
    ).rejects.toThrow(/`sound\.presets\.notifiy`: there is no sound by that name/);
  });

  it.each([
    [{ wave: 'saw', frequency: 440, decay: 0.1 }, /`sound\.presets\.tap\[0\]\.wave`/],
    [{ wave: 'sine', frequency: 440 }, /`sound\.presets\.tap\[0\]\.decay`/],
    [{ wave: 'sine', decay: 0.1 }, /`sound\.presets\.tap\[0\]\.frequency`/],
    [
      { wave: 'noise', decay: 0.1, filter: { type: 'low', frequency: 800 } },
      /`sound\.presets\.tap\[0\]\.filter\.type`/,
    ],
    [{ wave: 'sine', frequency: 440, decay: 0.1, gain: 2 }, /`sound\.presets\.tap\[0\]\.gain`/],
    [
      { wave: 'sine', frequency: 440, decay: 0.1, attack: -1 },
      /`sound\.presets\.tap\[0\]\.attack`/,
    ],
  ])('stops the build on a layer that cannot play: %o', async (layer: object, message: RegExp) => {
    await expect(transformWith({ sound: { presets: { tap: [layer] } } } as never)).rejects.toThrow(
      message,
    );
  });

  it('stops the build on a recipe with no layer', async () => {
    await expect(transformWith({ sound: { presets: { tap: [] } } })).rejects.toThrow(
      /`sound\.presets\.tap` must be a non-empty array/,
    );
  });

  it('warns, without stopping, about a sound longer than the defaults', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const long = [{ wave: 'sine', frequency: 440, decay: 0.4, delay: 0.1 }] as const;

    const result = await transformWith({ sound: { presets: { notify: long } } });

    expect(result).not.toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/`sound\.presets\.notify` lasts 500 ms/),
    );
  });

  it('declares the same recipe shape as the store', () => {
    // The plugin declares the shape itself, since it compiles without `src/`.
    // Assigning each type to the other fails `vp check` once they drift apart.
    type StoreRecipes = Partial<Record<SoundName, SoundRecipe>>;
    type PluginRecipes = NonNullable<SoundOptions['presets']>;
    const accepts = <A, B extends A>(value: B): A => value;

    expect(accepts<StoreRecipes, PluginRecipes>({})).toEqual({});
    expect(accepts<PluginRecipes, StoreRecipes>({})).toEqual({});
  });
});
