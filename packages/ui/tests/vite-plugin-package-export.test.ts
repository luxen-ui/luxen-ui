import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vite-plus/test';

// A consumer's Vite config loads `luxen-ui/vite-plugin` with plain Node, and
// Node refuses to strip types from a file under node_modules
// (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING). Shipping the `.ts` source
// broke every non-Nuxt project, while this monorepo never noticed: its
// workspace symlink resolves outside node_modules. So the export must point at
// the compiled output of `tsconfig.tooling.json`.

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8')) as {
  exports: Record<string, unknown>;
  files: string[];
};

describe('The published vite-plugin', () => {
  it('resolves to compiled JavaScript with its own types', () => {
    expect(pkg.exports['./vite-plugin']).toEqual({
      types: './dist/vite-plugin.d.ts',
      import: './dist/vite-plugin.js',
    });
  });

  it('does not ship the TypeScript source', () => {
    expect(pkg.files).not.toContain('vite-plugin.ts');
  });

  it('types against vite, which consumers have, not vite-plus', () => {
    const source = readFileSync(new URL('../vite-plugin.ts', import.meta.url), 'utf-8');
    expect(source).not.toMatch(/from 'vite-plus'/);
  });
});
