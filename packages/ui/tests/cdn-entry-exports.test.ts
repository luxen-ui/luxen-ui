import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAst } from 'vite-plus';
import { describe, expect, it } from 'vite-plus/test';
import cdnConfig from '../vite.config.js';

// The CDN build (`vite.config.ts`, written to `cdn/` by `pnpm build`) turns
// every `src/html/**/*.ts` file into a module of its own, so a page can import
// any of them by URL. Vite builds it as an app, and an app build drops the
// exports of an entry that no other module imports: `cdn/elements/toast/index.js`
// still registered `<l-toast>` but no longer exported `toast`, so
// `import { toast } from '…/cdn/elements/toast/index.js'` failed to load.
// The build passes and the e2e specs only check that elements register, so
// nothing else notices.
//
// These tests compare, for every entry of that build, the names its source
// exports (types left out) with the names the built module exports. They are
// skipped when `cdn/` has not been built; CI builds before it tests.

const CDN = fileURLToPath(new URL('../cdn', import.meta.url));

// `{ 'elements/toast/index': '/…/src/html/elements/toast/index.ts', … }`
const input = cdnConfig.build?.rolldownOptions?.input;
if (!input || typeof input !== 'object' || Array.isArray(input)) {
  throw new Error('vite.config.ts: expected `build.rolldownOptions.input` to map names to files');
}

type Program = ReturnType<typeof parseAst>;
type ModuleExportName = { type: 'Identifier'; name: string } | { type: 'Literal'; value: unknown };

const nameOf = (node: ModuleExportName) =>
  node.type === 'Identifier' ? node.name : String(node.value);

/**
 * The runtime names a module exports, following its relative `export *`.
 * `resolveFrom` maps a relative specifier to the file it loads.
 */
function exportedNames(file: string, resolveFrom: (from: string, specifier: string) => string) {
  const program: Program = parseAst(readFileSync(file, 'utf-8'), {
    lang: file.endsWith('.ts') ? 'ts' : 'js',
  });
  const names = new Set<string>();

  for (const node of program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      names.add('default');
    } else if (node.type === 'ExportAllDeclaration') {
      if (node.exportKind === 'type') continue;
      if (node.exported) {
        names.add(nameOf(node.exported));
        continue;
      }
      const specifier = node.source.value;
      if (!specifier.startsWith('.')) {
        throw new Error(`${file}: cannot list the names of \`export * from '${specifier}'\``);
      }
      // `export *` never re-exports a default.
      for (const name of exportedNames(resolveFrom(file, specifier), resolveFrom)) {
        if (name !== 'default') names.add(name);
      }
    } else if (node.type === 'ExportNamedDeclaration') {
      // `export type`, `export interface`, `export declare …`
      if (node.exportKind === 'type') continue;
      for (const specifier of node.specifiers) {
        if (specifier.exportKind !== 'type') names.add(nameOf(specifier.exported));
      }
      const declaration = node.declaration;
      if (declaration?.type === 'VariableDeclaration') {
        for (const { id } of declaration.declarations) {
          if (id.type !== 'Identifier') throw new Error(`${file}: destructured export`);
          names.add(id.name);
        }
      } else if (declaration && 'id' in declaration && declaration.id?.type === 'Identifier') {
        // function, class, enum
        names.add(declaration.id.name);
      }
    }
  }

  return names;
}

// Sources import each other as `./x.js`.
const resolveSource = (from: string, specifier: string) =>
  resolve(dirname(from), specifier).replace(/\.js$/, '.ts');
const resolveBuilt = (from: string, specifier: string) => resolve(dirname(from), specifier);

const sourceNames = (entry: string) => exportedNames(input[entry], resolveSource);
const builtNames = (entry: string) => exportedNames(resolve(CDN, `${entry}.js`), resolveBuilt);

describe.skipIf(!existsSync(CDN))('A CDN module exports what its source exports', () => {
  it.each(Object.keys(input))('%s', (entry: string) => {
    const built = builtNames(entry);
    expect([...sourceNames(entry)].filter((name) => !built.has(name))).toEqual([]);
  });

  // The names a page actually imports. Also proves the comparison above sees
  // value exports at all, so it cannot pass by reading none on either side.
  it.each([
    ['color-scheme', 'colorScheme'],
    ['events/index', 'ShowEvent'],
    ['elements/toast/index', 'toast'],
    ['elements/dialog/index', 'Dialog'],
  ])('%s exports %s', (entry: string, name: string) => {
    expect(sourceNames(entry)).toContain(name);
    expect(builtNames(entry)).toContain(name);
  });
});
