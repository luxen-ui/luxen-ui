import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

// A consumer's Vite config loads `luxen-ui/vite-plugin` with plain Node, and
// Node refuses to strip types from a file under node_modules
// (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING). Shipping the `.ts` source
// broke every non-Nuxt project, while this monorepo never noticed: its
// workspace symlink resolves outside node_modules. So the export must point at
// the compiled output of `tsconfig.tooling.json` (emitted by `prepare` on
// install, and by `build`).

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8')) as {
  exports: Record<string, unknown>;
  files: string[];
};

describe('The published vite-plugin', () => {
  it('resolves to compiled JavaScript with its own types, for every condition', () => {
    expect(pkg.exports['./vite-plugin']).toEqual({
      types: './dist/vite-plugin.d.ts',
      default: './dist/vite-plugin.js',
    });
  });

  it('does not ship the TypeScript source', () => {
    expect(pkg.files).not.toContain('vite-plugin.ts');
  });

  it('types against vite, which consumers have, not vite-plus', () => {
    const source = readFileSync(new URL('../vite-plugin.ts', import.meta.url), 'utf-8');
    expect(source).not.toMatch(/from 'vite-plus'/);
  });

  it('loads in plain Node and returns the plugin', () => {
    // A child process, not `import()`: the test runner would transform the
    // file and hide exactly the failures a consumer's Node would hit.
    const entry = fileURLToPath(new URL('../dist/vite-plugin.js', import.meta.url));
    const out = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const { default: luxen } = await import(${JSON.stringify(entry)}); console.log(luxen().name);`,
      ],
      { encoding: 'utf-8' },
    );
    expect(out.trim()).toBe('luxen');
  });
});
