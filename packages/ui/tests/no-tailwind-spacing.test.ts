// Pulls in the ambient `declare module 'vitest'` stub (vitest is injected by the
// Vite+ runner at runtime, so its types aren't resolvable to the lint checker).
// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { basename, dirname, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, loadSources } from './helpers/source-files.js';

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
 * Comments are stripped before matching (see `helpers/source-files.ts`). The
 * rule is worth explaining where it bites, and an explanation has to name the
 * pattern it forbids — `radio-group` spells out why its gap avoids `--spacing`,
 * and that prose alone was enough to trip a raw substring search.
 */

const files = loadSources();

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
