// Pulls in the ambient `declare module 'vitest'` stub (vitest is injected by the
// Vite+ runner at runtime, so its types aren't resolvable to the lint checker).
// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * `--spacing` belongs to Tailwind's base layer, not to Luxen. A stylesheet that
 * reads it resolves correctly inside a Tailwind project and silently collapses
 * everywhere else: the `calc()` is invalid at computed-value time, so the
 * declaration is dropped and `gap`/`padding` fall back to zero.
 *
 * That is not cosmetic. It first surfaced as a real axe `target-size` failure on
 * `.l-radio-group`, whose stacked radio boxes ended up close enough to breach
 * WCAG 2.5.8 once their gap vanished — in the a11y suite's iframe, which loads
 * no Tailwind. Every other element carrying the same reference was collapsing
 * too, with nothing to raise a hand.
 *
 * Use the `--l-spacing-*` tokens instead: they ship with `luxen-ui/css/tokens`,
 * a required dependency of every element, and hold the same values.
 *
 * An element may still expose its own `--spacing` as a public knob (see
 * `divider.css` and `rating.css`). Declaring it makes the reference resolve on
 * its own terms, so those are exempt. The declaration does not have to sit in
 * the same file — `rating.ts` builds inline styles that read the knob its
 * co-located `rating.css` defines — so the exemption is checked across the
 * files an element is made of: same directory, same basename.
 *
 * Comments are stripped before matching. The rule is worth explaining where it
 * bites, and an explanation has to name the pattern it forbids — `radio-group`
 * spells out why its gap avoids `--spacing`, and that prose alone was enough to
 * trip a raw substring search.
 */

const SRC = fileURLToPath(new URL('../src', import.meta.url));

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(css|ts)$/.test(entry)) yield path;
  }
}

/*
 * One pass rather than a regex per comment style, because either regex alone
 * gets the other case wrong: a line-anchored `//` pattern misses a trailing
 * `// never var(--spacing)` and keeps failing the build on prose, while a
 * `/* … *\/` pattern run over raw source lets a `/*` inside a string swallow
 * the declarations after it — a guard that fails open.
 *
 * String contents are kept, only recognised. `rating.ts` builds inline styles
 * holding `var(--spacing)` inside template literals, and those must stay
 * visible to the search or the exemption below would be the only thing
 * covering them.
 */
function stripComments(source: string, path: string) {
  const isTs = path.endsWith('.ts');
  let out = '';
  let i = 0;

  while (i < source.length) {
    const pair = source.slice(i, i + 2);

    if (pair === '/*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    // `//` opens a comment in TypeScript only; in CSS it is not one, and a bare
    // `url(https://…)` must survive.
    if (isTs && pair === '//') {
      const end = source.indexOf('\n', i + 2);
      i = end === -1 ? source.length : end;
      continue;
    }

    const char = source[i];
    if (char === '"' || char === "'" || (isTs && char === '`')) {
      out += char;
      i += 1;
      while (i < source.length && source[i] !== char) {
        const step = source[i] === '\\' ? 2 : 1;
        out += source.slice(i, i + step);
        i += step;
      }
      out += source[i] ?? '';
      i += 1;
      continue;
    }

    out += char;
    i += 1;
  }

  return out;
}

const files = [...walk(SRC)].map((path) => ({
  path,
  code: stripComments(readFileSync(path, 'utf8'), path),
}));

/** Every file making up the same element: same directory, same basename. */
const declaresSpacing = (path: string) =>
  files.some(
    (other) =>
      dirname(other.path) === dirname(path) &&
      basename(other.path).replace(/\.\w+$/, '') === basename(path).replace(/\.\w+$/, '') &&
      other.code.includes('--spacing:'),
  );

const offenders = files
  .filter(({ code }) => code.includes('var(--spacing)'))
  .filter(({ path }) => !declaresSpacing(path))
  .map(({ path }) => relative(SRC, path));

describe("Element styles never read Tailwind's --spacing", () => {
  it('has no file referencing it without declaring it', () => {
    expect(offenders).toEqual([]);
  });
});
