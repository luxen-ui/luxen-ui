/*
 * cem-plugin: inherited-css-states
 *
 * Custom states (`:state(name)`) are documented with the standard `@cssstate`
 * JSDoc tag, which CEM reads into `declaration.cssStates` on its own. CEM also
 * copies them down to subclasses — but only from classes it analyzed, and the
 * analyzer globs `src/html/elements/` alone. Shared base classes such as
 * `LuxenFormAssociatedElement` (`src/html/shared/`) stay out on purpose:
 * pulling them in would also copy every inherited member into each element's
 * reference.
 *
 * So, for every declaration, this plugin walks up its superclass chain. An
 * analyzed ancestor is followed through the manifest; an ancestor from this
 * package that was not analyzed is read from its TypeScript source, and its
 * own base class is followed through its imports. Every `@cssstate` tag found
 * on the way is appended. Classes from other packages (`lit`) end the walk.
 * The base class JSDoc stays the single source of truth.
 *
 *   @cssstate user-invalid - The value is invalid and the user has interacted.
 *
 * Output: declaration.cssStates += [{ name, description }]
 */
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// The JSDoc parser the analyzer reads `@cssstate` with on element classes,
// resolved from the analyzer itself so both read the same tags the same way:
// a tag only at the start of a line, `{@link}` or a stray `@` kept in its
// description.
const require = createRequire(import.meta.url);
const analyzer = createRequire(require.resolve('@custom-elements-manifest/analyzer/package.json'));
const { parse } = require(analyzer.resolve('comment-parser'));

// The TypeScript instance the analyzer itself runs, handed to analyzePhase.
let ts;

/** `/src/html/shared/x.js` (a manifest module path) → the `.ts` source, if any. */
function sourceOf(modulePath) {
  const file = resolve(PKG_ROOT, `.${modulePath}`).replace(/\.js$/, '.ts');
  return existsSync(file) ? file : null;
}

/**
 * The `@cssstate` tags of class `name` in `file`, then those of its own base
 * class, followed through the file's relative imports.
 */
function statesInSource(name, file, seen = new Set()) {
  const key = `${file}#${name}`;
  if (seen.has(key)) return [];
  seen.add(key);

  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf-8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const cls = source.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === name);
  // Re-exported from elsewhere (an `export *` barrel): not followed.
  if (!cls) return [];

  // As the analyzer does: each JSDoc block above the class, `- ` dropped.
  const states = (cls.jsDoc ?? [])
    .flatMap((doc) => parse(doc.getFullText()))
    .flatMap((block) => block.tags)
    .filter((tag) => tag.tag === 'cssstate')
    .map((tag) => ({ name: tag.name, description: tag.description.replace(/^-\s*/, '').trim() }));

  const base = cls.heritageClauses
    ?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)
    ?.types[0]?.expression.getText(source);
  const from = base && importPathOf(source, base);
  const baseFile = from?.startsWith('.')
    ? resolve(dirname(file), from.replace(/\.js$/, '.ts'))
    : null;
  if (baseFile && existsSync(baseFile)) states.push(...statesInSource(base, baseFile, seen));
  return states;
}

function importPathOf(source, name) {
  for (const s of source.statements) {
    if (!ts.isImportDeclaration(s)) continue;
    const named = s.importClause?.namedBindings;
    if (named && ts.isNamedImports(named) && named.elements.some((e) => e.name.text === name)) {
      return s.moduleSpecifier.text;
    }
  }
  return null;
}

export function inheritedCssStatesPlugin() {
  return {
    name: 'luxen-inherited-css-states',
    analyzePhase(context) {
      ts ??= context.ts;
    },
    packageLinkPhase({ customElementsManifest }) {
      const modules = customElementsManifest.modules ?? [];
      // A superclass reference names the emitted module (`/src/…/x.js`); the
      // manifest keys modules by source path (`src/…/x.ts`).
      const pathOf = (module) => module.replace(/^\//, '').replace(/\.js$/, '.ts');
      const declarationOf = (ref) =>
        modules
          .find((m) => m.path === pathOf(ref.module))
          ?.declarations?.find((d) => d.name === ref.name);

      // States from ancestors CEM did not analyze, at any depth.
      const unanalyzedStates = (decl, seen = new Set()) => {
        const ref = decl.superclass;
        if (!ref?.module || seen.has(decl)) return [];
        seen.add(decl);
        const analyzed = declarationOf(ref);
        if (analyzed) return unanalyzedStates(analyzed, seen);
        const file = sourceOf(ref.module);
        return file ? statesInSource(ref.name, file) : [];
      };

      for (const mod of modules) {
        for (const decl of mod.declarations ?? []) {
          const inherited = unanalyzedStates(decl);
          if (!inherited.length) continue;
          const own = decl.cssStates ?? [];
          const names = new Set(own.map((s) => s.name));
          decl.cssStates = [...own, ...inherited.filter((s) => !names.has(s.name))];
        }
      }
    },
  };
}
