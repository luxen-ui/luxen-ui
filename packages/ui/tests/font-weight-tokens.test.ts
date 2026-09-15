// Pulls in the ambient `declare module 'vitest'` stub (vitest is injected by the
// Vite+ runner at runtime, so its types aren't resolvable to the lint checker).
// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, loadSources, stripComments } from './helpers/source-files.js';

/*
 * Luxen ships a full weight scale (`--l-font-weight-thin` … `-black`) and every
 * element is expected to read it. A literal `font-weight: 600` renders exactly
 * the same at the default token values, so nothing looks wrong — until a
 * consumer recalibrates the scale, which they do because two families at the
 * same nominal weight do not carry the same ink. Then the elements holding a
 * literal quietly stay behind while the rest of the page moves.
 *
 * That is how this was found: sixteen literals had accumulated, and a dropdown
 * section label sat 4.2 % lighter in ink than the text beside it.
 *
 * Only numeric weights are rejected. Keywords (`inherit`, `normal`, `bold`, …)
 * are relative or inherited rather than a point on the scale, so they stay.
 *
 * `.ts` is scanned alongside `.css` because shadow styles are not the only way
 * a weight reaches the page — a template assembling `style="font-weight:600"`
 * bypasses every stylesheet.
 */

/*
 * The whole file is searched at once rather than line by line: a declaration
 * can wrap onto the next line, and a line can hold more than one. The value is
 * matched loosely (`[^;}]*`) and then tested for a leading digit, so a literal
 * carrying a suffix — `600 !important`, `600.0` — is still caught instead of
 * slipping past a stricter pattern.
 *
 * `(^|[^\w-])` keeps the match off custom-property *names*: `--l-font-weight-
 * semibold: 600` in a token file declares the scale, and `--label-font-weight`
 * is a knob, neither of which is a declaration reading a weight.
 */
const DECLARATION = /(^|[^\w-])font-weight\s*:\s*([^;}]*)/g;

const WEIGHT_TOKENS: Record<string, string> = {
  100: 'thin',
  200: 'extralight',
  300: 'light',
  400: 'normal',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
  800: 'extrabold',
  900: 'black',
};

function findLiterals(code: string, path: string) {
  const found: string[] = [];
  for (const match of code.matchAll(DECLARATION)) {
    const value = match[2].trim();
    const weight = /^\d+/.exec(value)?.[0];
    if (!weight) continue; // a keyword, or var(…) — both fine
    const line = code.slice(0, match.index).split('\n').length;
    const token = WEIGHT_TOKENS[weight];
    found.push(
      `${relative(SRC, path)}:${line}: font-weight: ${value} — ${
        token
          ? `use var(--l-font-weight-${token})`
          : `${weight} is not on the scale, use the nearest var(--l-font-weight-*) step`
      }`,
    );
  }
  return found;
}

const offenders = loadSources().flatMap(({ path, code }) => findLiterals(code, path));

describe('Element styles read the font-weight tokens', () => {
  it('has no hardcoded numeric weight', () => {
    expect(offenders).toEqual([]);
  });

  /*
   * The matcher is the whole guard, so it is pinned directly. Every case below
   * is one a previous shape of this check let through: a suffixed value, a
   * wrapped declaration, a second declaration on the same line, and a literal
   * sitting after a string that contains `/*`, which a naive comment strip
   * blanks out along with the comment it thinks it found.
   */
  const cases: [string, string[]][] = [
    ['.a { font-weight: 600; }', ['600']],
    ['.a { font-weight:600 }', ['600']],
    ['.a { font-weight: 600 !important; }', ['600 !important']],
    ['.a { font-weight:\n  600; }', ['600']],
    ['.a { font-weight: 600; } .b { font-weight: 500; }', ['600', '500']],
    ['.a { content: "/*"; }\n.b { font-weight: 600; }\n.c { content: "*/"; }', ['600']],
    ['.a { font-weight: var(--l-font-weight-semibold); }', []],
    ['.a { font-weight: inherit; }', []],
    ['.a { font-weight: bold; }', []],
    [':root { --l-font-weight-semibold: 600; }', []],
    ['.a { --label-font-weight: 600; }', []],
    ['/* font-weight: 600 */\n.a { color: red; }', []],
  ];

  it.each(cases)('matches %j', (source: string, expected: string[]) => {
    const values = findLiterals(stripComments(source, 'x.css'), 'x.css').map(
      (message) => /font-weight: (.+?) —/.exec(message)?.[1],
    );
    expect(values).toEqual(expected);
  });

  it('reports the real line number after a comment', () => {
    const source = '/* a\n   multi-line\n   comment */\n.a { font-weight: 600; }';
    const [message] = findLiterals(stripComments(source, 'x.css'), 'x.css');
    expect(message).toContain(':4:');
  });
});
