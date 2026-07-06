// Pulls in the ambient `declare module 'vitest'` stub (vitest is injected by the
// Vite+ runner at runtime, so its types aren't resolvable to the lint checker).
// oxlint-disable-next-line typescript/triple-slash-reference -- required: test files aren't in any tsconfig include.
/// <reference path="./vitest.d.ts" />
import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import luxenPrefix from '../postcss-plugin-prefix.js';

function run(css: string, opts: { elementPrefix?: string; cssPrefix?: string }): string {
  return postcss([luxenPrefix(opts)]).process(css, { from: undefined }).css;
}

// A trimmed-down slice of the real token preset: a couple of literal tokens, a
// `light-dark()` alias referencing primitives, and a self-reference alias.
const TOKENS = `:root {
  --l-color-gray-900: #111;
  --l-focus-ring: #d9461f;
  --l-color-text-primary: light-dark(var(--l-color-gray-700), var(--l-color-gray-200));
  --l-color-border-overlay: var(--l-color-border);
}`;

describe('postcss-plugin-prefix — design-token bridging (RFC custom-prefix)', () => {
  it('renames every --l-* token declaration to the custom prefix', () => {
    const out = run(TOKENS, { cssPrefix: 'p' });
    expect(out).toContain('--p-focus-ring: #d9461f;');
    expect(out).toContain('--p-color-gray-900: #111;');
    // var() references inside values are rewritten too.
    expect(out).toContain('light-dark(var(--p-color-gray-700), var(--p-color-gray-200))');
  });

  it('emits a :root alias bridging each canonical --l-* token to --{prefix}-*', () => {
    const out = run(TOKENS, { cssPrefix: 'p' });
    expect(out).toContain('--l-focus-ring: var(--p-focus-ring);');
    expect(out).toContain('--l-color-gray-900: var(--p-color-gray-900);');
    expect(out).toContain('--l-color-text-primary: var(--p-color-text-primary);');
    expect(out).toContain('--l-color-border-overlay: var(--p-color-border-overlay);');
  });

  it('leaves no dangling --l-* token declaration outside the bridge block', () => {
    const out = run(TOKENS, { cssPrefix: 'p' });
    const [body, bridge = ''] = out.split('/* luxen-prefix:');
    // The token body no longer declares any --l-* property…
    expect(body).not.toMatch(/--l-[\w-]+\s*:/);
    // …and every --l-* in the bridge resolves to a --p-* twin that the body defines.
    for (const m of bridge.matchAll(/--l-([\w-]+):\s*var\(--p-([\w-]+)\)/g)) {
      expect(m[1]).toBe(m[2]);
      expect(body).toContain(`--p-${m[2]}:`);
    }
  });

  it('bridges only when a token is actually declared (no stray block)', () => {
    // CSS that merely *references* --l-* tokens (e.g. a light-DOM element file)
    // declares none, so no bridge is emitted — the defining file carries it.
    const out = run('.l-button { color: var(--l-color-text-primary); }', { cssPrefix: 'p' });
    expect(out).toContain('.p-button');
    expect(out).toContain('var(--p-color-text-primary)');
    expect(out).not.toContain('luxen-prefix: bridge');
  });

  it('is a no-op for the default `l` prefix (no bridge, unchanged tokens)', () => {
    const out = run(TOKENS, { cssPrefix: 'l', elementPrefix: 'l' });
    expect(out).toBe(TOKENS);
    expect(out).not.toContain('luxen-prefix: bridge');
  });

  it('uses the css prefix for the bridge even when the element prefix differs', () => {
    // Asymmetric config (tags `pulse-*`, css `p-*`): the token bridge follows
    // the CSS prefix, never the element prefix.
    const out = run(TOKENS, { elementPrefix: 'pulse', cssPrefix: 'p' });
    expect(out).toContain('--l-focus-ring: var(--p-focus-ring);');
    expect(out).not.toContain('pulse-focus-ring');
  });
});

describe('postcss-plugin-prefix — @scope prelude rewriting (RFC custom-prefix)', () => {
  it('rewrites a bare `@scope (l-…)` root to the element prefix', () => {
    const out = run('@scope (l-toast) { :scope { color: red } }', {
      elementPrefix: 'po',
      cssPrefix: 'p',
    });
    expect(out).toContain('@scope (po-toast)');
    expect(out).not.toContain('@scope (l-toast)');
  });

  it('rewrites every root in a comma-separated + attribute-qualified prelude', () => {
    // The real `input-stepper/default.css` form.
    const css =
      "@scope (l-input-stepper:not([appearance]), l-input-stepper[appearance='default']) { :scope {} }";
    const out = run(css, { elementPrefix: 'po', cssPrefix: 'p' });
    expect(out).toContain('po-input-stepper:not([appearance])');
    expect(out).toContain("po-input-stepper[appearance='default']");
    // No `l-` element root survives anywhere in the prelude (catches a
    // partial rewrite where only the first comma-separated root is touched).
    expect(out).not.toContain('l-input-stepper');
  });

  it('rewrites roots wrapped in `:not(:defined)` (unregistered-element guard form)', () => {
    // The second `@scope` block in `input-stepper/default.css`.
    const css =
      "@scope (l-input-stepper:not(:defined):not([appearance]), l-input-stepper:not(:defined)[appearance='default']) { :scope {} }";
    const out = run(css, { elementPrefix: 'po', cssPrefix: 'p' });
    expect(out).toContain('po-input-stepper:not(:defined):not([appearance])');
    expect(out).toContain("po-input-stepper:not(:defined)[appearance='default']");
    expect(out).not.toContain('l-input-stepper');
  });

  it('rewrites the root with the element prefix and a `.l-` limit with the css prefix', () => {
    const out = run('@scope (l-x) to (.l-inner) { :scope {} }', {
      elementPrefix: 'po',
      cssPrefix: 'p',
    });
    // Root is a tag → element prefix; limit is a class → css prefix.
    expect(out).toContain('@scope (po-x) to (.p-inner)');
  });

  it('leaves the prelude untouched for the default `l` build', () => {
    const css = '@scope (l-toast) { :scope {} }';
    expect(run(css, { elementPrefix: 'l', cssPrefix: 'l' })).toBe(css);
  });
});
