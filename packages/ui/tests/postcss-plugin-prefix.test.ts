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
