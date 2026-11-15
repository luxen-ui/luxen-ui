import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, matchesGlob, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

// Sound ships inside `luxen-ui` as the `luxen-ui/sound` subpath, not as a
// package of its own. That only holds if an application that never imports it
// carries none of it, and if importing it on a server touches nothing. These
// tests read the built `dist` (written by `pnpm build`; CI builds before it
// tests), the way a bundler and Node would.

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = resolve(ROOT, 'dist');
const SOUND = resolve(DIST, 'sound/index.js');
const built = existsSync(SOUND);

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as {
  sideEffects: string[];
};

/** Every module the file reaches through static and dynamic relative imports. */
function moduleGraph(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  const specifier = /(?:\bfrom|\bimport)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    for (const [, path] of readFileSync(file, 'utf-8').matchAll(specifier)) {
      queue.push(resolve(dirname(file), path));
    }
  }
  return seen;
}

describe.runIf(built)('An application that never imports luxen-ui/sound', () => {
  it('reaches none of it from the main entry', () => {
    const graph = [...moduleGraph(resolve(DIST, 'index.js'))].map((file) => relative(DIST, file));

    expect(graph.length).toBeGreaterThan(1);
    expect(graph.filter((file) => file.startsWith('sound/'))).toEqual([]);
  });

  it('lets the bundler drop it: the module is not declared as having side effects', () => {
    const file = relative(ROOT, SOUND);
    const matching = pkg.sideEffects.filter(
      (pattern) =>
        matchesGlob(file, pattern) ||
        (!pattern.includes('/') && matchesGlob(file, `**/${pattern}`)),
    );

    expect(matching).toEqual([]);
  });
});

describe.runIf(built)('A server importing luxen-ui/sound', () => {
  it('loads it without a DOM, finds sound off, and logs nothing', () => {
    // A child process, not `import()`: the test runner provides globals a
    // server does not have. Reading the state is what a server-rendered sound
    // control does; on Node 26, touching `localStorage` there prints a warning.
    const run = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const { sound } = await import(${JSON.stringify(SOUND)});
         console.log(JSON.stringify({ enabled: sound.enabled, mutedBy: sound.mutedBy }));`,
      ],
      { encoding: 'utf-8' },
    );

    expect(run.status).toBe(0);
    expect(JSON.parse(run.stdout.trim())).toEqual({ enabled: false, mutedBy: 'preference' });
    expect(run.stderr).toBe('');
  });
});
