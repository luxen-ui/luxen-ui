import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import luxen from '../vite-plugin.js';

// The plugin reads `luxen.config.mjs` once, in its `config` hook, and Vite only
// watches its own config file. So the plugin watches this one and restarts the
// dev server when it changes. The restarted server runs in the same Node
// process, so these tests also check that it reads the edited file, not the
// copy Node cached on the first load.
//
// The plugin looks for the file in the working directory: each test runs in a
// throwaway project of its own.

/** The plugin's source: Node strips its types, as `scripts/check-metadata.mjs` relies on. */
const PLUGIN = fileURLToPath(new URL('../vite-plugin.ts', import.meta.url));
const REGISTRY_PATH = fileURLToPath(new URL('../src/html/registry.ts', import.meta.url));
const REGISTRY_ID = '/app/node_modules/luxen-ui/dist/registry.js';

let previousCwd: string;
let project: string;

beforeAll(() => {
  previousCwd = process.cwd();
});

beforeEach(() => {
  // The real path: `process.cwd()` reports it after `chdir` (`/private/var` on macOS).
  project = realpathSync(mkdtempSync(join(tmpdir(), 'luxen-config-watch-')));
  process.chdir(project);
  return () => {
    process.chdir(previousCwd);
    rmSync(project, { recursive: true, force: true });
  };
});

afterAll(() => {
  process.chdir(previousCwd);
});

type Listener = (file: string) => void;

/** The plugin after its `config` hook, as Vite runs it on each (re)start. */
async function startPlugin() {
  const plugin = luxen();
  await (plugin.config as unknown as () => Promise<unknown>).call(undefined);
  return plugin;
}

/** Hand the plugin a stub dev server, and return a way to fire watcher events at it. */
async function serve() {
  const plugin = await startPlugin();
  const listeners: Array<[event: string, listener: Listener]> = [];
  const server = {
    watcher: {
      add: vi.fn(),
      on: vi.fn((event: string, listener: Listener) => {
        listeners.push([event, listener]);
      }),
    },
    restart: vi.fn(async () => {}),
    config: { logger: { info: vi.fn(), error: vi.fn() } },
  };
  (plugin.configureServer as unknown as (server: unknown) => void)(server);

  const emit = (event: string, file: string) => {
    for (const [name, listener] of listeners) if (name === event) listener(file);
  };
  return { server, emit };
}

describe('A dev server watching luxen.config', () => {
  it('watches luxen.config.mjs and luxen.config.js, even before either exists', async () => {
    const { server } = await serve();

    expect(server.watcher.add).toHaveBeenCalledWith([
      join(project, 'luxen.config.mjs'),
      join(project, 'luxen.config.js'),
    ]);
  });

  for (const [event, change] of [
    ['add', 'created'],
    ['change', 'edited'],
    ['unlink', 'deleted'],
  ] as const) {
    it(`restarts when luxen.config.mjs is ${change}`, async () => {
      const { server, emit } = await serve();

      emit(event, join(project, 'luxen.config.mjs'));

      expect(server.restart).toHaveBeenCalledOnce();
      expect(server.config.logger.info).toHaveBeenCalledWith(
        'luxen.config.mjs changed, restarting server...',
        expect.anything(),
      );
    });
  }

  it('restarts when luxen.config.js is edited', async () => {
    const { server, emit } = await serve();

    emit('change', join(project, 'luxen.config.js'));

    expect(server.restart).toHaveBeenCalledOnce();
  });

  it('ignores every other file', async () => {
    const { server, emit } = await serve();

    emit('change', join(project, 'vite.config.mjs'));
    emit('change', join(project, 'src', 'luxen.config.mjs'));
    emit('add', join(project, 'luxen.config.mjs.bak'));

    expect(server.restart).not.toHaveBeenCalled();
  });

  it('reports a restart that fails instead of leaving it unhandled', async () => {
    const { server, emit } = await serve();
    server.restart.mockRejectedValueOnce(new Error('port taken'));

    emit('change', join(project, 'luxen.config.mjs'));
    await vi.waitFor(() => {
      expect(server.config.logger.error).toHaveBeenCalledWith('Error: port taken');
    });
  });
});

/**
 * Write each `[file, content]` step (`null` deletes the file) and start the
 * plugin again after each one, all in one plain Node process, as a restarted
 * dev server does. Returns the element prefix baked after each step.
 *
 * A child process, not this test runner: the runner loads `luxen.config`
 * through its own module cache, and would hide the one Node keeps.
 */
function prefixesAcrossRestarts(steps: Array<[file: string, content: string | null]>): string[] {
  const script = `
    import { readFileSync, rmSync, writeFileSync } from 'node:fs';
    const { default: luxen } = await import(${JSON.stringify(PLUGIN)});
    const registry = readFileSync(${JSON.stringify(REGISTRY_PATH)}, 'utf-8');
    const prefixes = [];
    for (const [file, content] of ${JSON.stringify(steps)}) {
      if (content === null) rmSync(file);
      else writeFileSync(file, content);
      const plugin = luxen();
      await plugin.config.call(undefined);
      const code = plugin.transform.call(plugin, registry, ${JSON.stringify(REGISTRY_ID)})?.code ?? registry;
      prefixes.push(/let _elementPrefix = ["']([^"']*)["'];/.exec(code)?.[1]);
    }
    console.log(JSON.stringify(prefixes));
  `;
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: project,
    encoding: 'utf-8',
  });
  return JSON.parse(out) as string[];
}

describe('A dev server restarted after an edit', () => {
  it('bakes the edited luxen.config.mjs, not the copy Node loaded first', () => {
    expect(
      prefixesAcrossRestarts([
        ['luxen.config.mjs', "export default { elementPrefix: 'acme' };\n"],
        ['luxen.config.mjs', "export default { elementPrefix: 'zeta' };\n"],
      ]),
    ).toEqual(['acme', 'zeta']);
  });

  it('bakes an edited CommonJS luxen.config.js too', () => {
    // No `"type": "module"`: the `.js` file is CommonJS, which Node also caches
    // by its path.
    writeFileSync('package.json', '{}\n');

    expect(
      prefixesAcrossRestarts([
        ['luxen.config.js', "module.exports = { elementPrefix: 'acme' };\n"],
        ['luxen.config.js', "module.exports = { elementPrefix: 'zeta' };\n"],
      ]),
    ).toEqual(['acme', 'zeta']);
  });

  it('goes back to the defaults once the file is deleted', () => {
    expect(
      prefixesAcrossRestarts([
        ['luxen.config.mjs', "export default { elementPrefix: 'acme' };\n"],
        ['luxen.config.mjs', null],
      ]),
    ).toEqual(['acme', 'l']);
  });
});
